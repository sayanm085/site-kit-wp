/**
 * PopularProductsWidget component.
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
 * External dependencies
 */
import PropTypes from 'prop-types';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_USER } from '../../../../googlesitekit/datastore/user/constants';
import { CORE_SITE } from '../../../../googlesitekit/datastore/site/constants';
import {
	DATE_RANGE_OFFSET,
	MODULES_ANALYTICS_4,
} from '../../datastore/constants';
import { MetricTileTable } from '../../../../components/KeyMetrics';
import Link from '../../../../components/Link';
import { ZeroDataMessage } from '../../../analytics/components/common';
import { numFmt } from '../../../../util';
const { useSelect, useInViewSelect } = Data;

export default function PopularProductsWidget( props ) {
	const { Widget, WidgetNull } = props;

	const productBasePaths = useSelect( ( select ) =>
		select( CORE_SITE ).getProductBasePaths()
	);

	const dates = useSelect( ( select ) =>
		select( CORE_USER ).getDateRangeDates( {
			offsetDays: DATE_RANGE_OFFSET,
		} )
	);

	const reportOptions = {
		...dates,
		dimensions: [ 'pageTitle', 'pagePath' ],
		dimensionFilters: {
			pagePath: {
				filterType: 'stringFilter',
				matchType: 'BEGINS_WITH',
				value: productBasePaths,
			},
		},
		metrics: [ { name: 'screenPageViews' } ],
		orderby: [
			{
				metric: { metricName: 'screenPageViews' },
				desc: true,
			},
		],
		limit: 3,
	};

	const showWidget = productBasePaths?.length > 0;

	const report = useInViewSelect( ( select ) =>
		showWidget
			? select( MODULES_ANALYTICS_4 ).getReport( reportOptions )
			: undefined
	);

	const loading = useInViewSelect( ( select ) =>
		showWidget
			? ! select( MODULES_ANALYTICS_4 ).hasFinishedResolution(
					'getReport',
					[ reportOptions ]
			  )
			: undefined
	);

	const { rows = [] } = report || {};

	const columns = useInViewSelect( ( select ) => {
		if ( ! showWidget ) {
			return [];
		}

		return [
			{
				field: 'dimensionValues',
				Component: ( { fieldValue } ) => {
					const [ title ] = fieldValue;
					const permaLink = select(
						MODULES_ANALYTICS_4
					).getServiceReportURL( 'ecomm-product', reportOptions );

					return (
						<Link
							href={ permaLink }
							title={ title.value }
							external
							hideExternalIndicator
						>
							{ title.value }
						</Link>
					);
				},
			},
			{
				field: 'metricValues.0.value',
				Component: ( { fieldValue } ) => (
					<strong>{ numFmt( fieldValue ) }</strong>
				),
			},
		];
	} );

	if ( ! showWidget ) {
		return <WidgetNull />;
	}

	return (
		<MetricTileTable
			Widget={ Widget }
			title={ __(
				'Most popular products by pageviews',
				'google-site-kit'
			) }
			loading={ loading }
			rows={ rows }
			columns={ columns }
			zeroStateContent={
				<ZeroDataMessage>
					{ __(
						'Analytics doesn’t have data for your site’s products yet',
						'google-site-kit'
					) }
				</ZeroDataMessage>
			}
		/>
	);
}

PopularProductsWidget.propTypes = {
	Widget: PropTypes.elementType.isRequired,
	WidgetNull: PropTypes.elementType.isRequired,
};
