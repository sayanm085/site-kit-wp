/**
 * AdSense module initialization.
 *
 * Site Kit by Google, Copyright 2020 Google LLC
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
import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import store from './datastore';
import { AREA_DASHBOARD_EARNINGS } from '../../googlesitekit/widgets/default-areas';
import { fillFilterWithComponent } from '../../util';
import { SetupMain } from './components/setup';
import {
	SettingsEdit,
	SettingsSetupIncomplete,
	SettingsView,
} from './components/settings';
import {
	DashboardZeroData,
	DashboardSummaryWidget,
	DashboardTopEarningPagesWidget,
} from './components/dashboard';
import AdSenseIcon from '../../../svg/adsense.svg';
import { STORE_NAME } from './datastore/constants';
import { ERROR_CODE_ADBLOCKER_ACTIVE } from './constants';

addFilter(
	'googlesitekit.AdSenseDashboardZeroData',
	'googlesitekit.AdSenseDashboardZeroDataRefactored',
	fillFilterWithComponent( DashboardZeroData )
);

let isAdBlockerActive = () => {};

export const registerStore = ( Data ) => {
	Data.registerStore( STORE_NAME, store );
	// TODO: fix hack
	isAdBlockerActive = () => Data.select( STORE_NAME ).isAdBlockerActive();
};

export const registerModule = ( Modules ) => {
	Modules.registerModule(
		'adsense',
		{
			storeName: 'modules/adsense',
			SettingsEditComponent: SettingsEdit,
			SettingsViewComponent: SettingsView,
			SettingsSetupIncompleteComponent: SettingsSetupIncomplete,
			SetupComponent: SetupMain,
			Icon: AdSenseIcon,
			checkRequirements: () => {
				if ( ! isAdBlockerActive() ) {
					return;
				}

				throw {
					code: ERROR_CODE_ADBLOCKER_ACTIVE,
					message: __( 'Ad blocker detected, you need to disable it in order to set up AdSense.', 'google-site-kit' ),
					data: null,
				};
			},
		}
	);
};

export const registerWidgets = ( Widgets ) => {
	Widgets.registerWidget(
		'adsenseSummary',
		{
			Component: DashboardSummaryWidget,
			width: Widgets.WIDGET_WIDTHS.HALF,
			priority: 1,
			wrapWidget: false,

		},
		[
			AREA_DASHBOARD_EARNINGS,
		],
	);
	Widgets.registerWidget(
		'adsenseTopEarningPages',
		{
			Component: DashboardTopEarningPagesWidget,
			width: Widgets.WIDGET_WIDTHS.HALF,
			priority: 2,
			wrapWidget: false,
		},
		[
			AREA_DASHBOARD_EARNINGS,
		],
	);
};
