/**
 * Analytics utility functions.
 *
 * Site Kit by Google, Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Extracts data required for a pie chart from the Analytics 4 report information.
 *
 * @since n.e.x.t
 *
 * @param {Array}    report                    The report data.
 * @param {Object}   [options]                 Optional. Data extraction options.
 * @param {number}   [options.keyColumnIndex]  Optional. The number of a column to extract metrics data from.
 * @param {number}   [options.maxSlices]       Optional. Limit the number of slices to display.
 * @param {boolean}  [options.withOthers]      Optional. Whether to add "Others" record to the data map. Only relevant
 *                                             if `maxSlices` is passed. If passed, the final slice will be the
 *                                             "Others" slice, i.e. the number of actual row slices will be
 *                                             `maxSlices - 1`.
 * @param {Function} [options.tooltipCallback] Optional. A callback function for tooltip column values.
 * @return {Array} Extracted data.
 */
export function extractAnalyticsDataForPieChart( report, options = {} ) {
	const {
		keyColumnIndex = 0,
		maxSlices,
		withOthers = false,
		tooltipCallback,
	} = options;

	const { rows = [], totals = [] } = report || {};

	const withTooltips = typeof tooltipCallback === 'function';
	const columns = [ 'Source', 'Percent' ];
	if ( withTooltips ) {
		columns.push( {
			type: 'string',
			role: 'tooltip',
			p: {
				html: true,
			},
		} );
	}

	const totalUsers =
		totals?.[ 0 ]?.metricValues?.[ keyColumnIndex ]?.value || 0;
	const dataMap = [ columns ];

	const currentDateRangeRows = rows.filter(
		( { dimensionValues } ) => dimensionValues[ 1 ].value === 'date_range_0'
	);

	let hasOthers = withOthers;
	let rowsNumber = currentDateRangeRows.length;
	let others = 1;
	if ( maxSlices > 0 ) {
		hasOthers = withOthers && currentDateRangeRows.length > maxSlices;
		rowsNumber = Math.min(
			currentDateRangeRows.length,
			hasOthers ? maxSlices - 1 : maxSlices
		);
	} else {
		hasOthers = false;
		rowsNumber = currentDateRangeRows.length;
	}

	for ( let i = 0; i < rowsNumber; i++ ) {
		const row = currentDateRangeRows[ i ];
		const users = row.metricValues[ keyColumnIndex ].value;
		const percent = totalUsers > 0 ? users / totalUsers : 0;

		others -= percent;

		const rowData = [ row.dimensionValues[ 0 ].value, percent ];
		if ( withTooltips ) {
			const previousDateRangeRow = rows.find(
				( { dimensionValues } ) =>
					dimensionValues[ 1 ].value === 'date_range_1' &&
					dimensionValues[ 0 ].value ===
						row.dimensionValues[ 0 ].value
			);

			rowData.push(
				tooltipCallback( row, previousDateRangeRow, rowData )
			);
		}

		dataMap.push( rowData );
	}

	if ( hasOthers && others > 0 ) {
		const rowData = [ __( 'Others', 'google-site-kit' ), others ];
		if ( withTooltips ) {
			rowData.push( tooltipCallback( null, null, rowData ) );
		}

		dataMap.push( rowData );
	}

	return dataMap;
}

/**
 * Checks if there is a single row of data or one row of the provided GA4 report is contributing 100% of the total for a given dimension.
 *
 * Note that chart reports will be in the multi-date range format.
 *
 * @since n.e.x.t
 *
 * @param {Object} report The report data object.
 * @return {(boolean|undefined)} Returns undefined if report is undefined, true/false for the above conditions.
 */
export const isSingleSlice = ( report ) => {
	if ( report === undefined ) {
		return undefined;
	}

	const currentDateRangeRows = ( report?.rows || [] ).filter(
		( { dimensionValues } ) => dimensionValues[ 1 ].value === 'date_range_0'
	);

	if (
		currentDateRangeRows?.length === 1 ||
		currentDateRangeRows?.[ 0 ]?.metricValues?.[ 0 ]?.value ===
			report?.totals?.[ 0 ]?.metricValues?.[ 0 ]?.value
	) {
		return true;
	}

	return false;
};
