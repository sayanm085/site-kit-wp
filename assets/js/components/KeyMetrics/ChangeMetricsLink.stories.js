/**
 * Key Metrics ChangeMetricsLink Component Stories.
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
 * Internal dependencies
 */
import {
	provideKeyMetrics,
	provideUserAuthentication,
	provideUserCapabilities,
} from '../../../../tests/js/utils';
import WithRegistrySetup from '../../../../tests/js/WithRegistrySetup';
import ChangeMetricsLink from './ChangeMetricsLink';

const Template = () => <ChangeMetricsLink />;

export const Default = Template.bind( {} );
Default.storyName = 'ChangeMetricsLink';
Default.scenario = {
	label: 'KeyMetrics/ChangeMetricsLink',
};

export default {
	title: 'Key Metrics/ChangeMetricsLink',
	component: ChangeMetricsLink,
	decorators: [
		( Story ) => {
			const setupRegistry = ( registry ) => {
				provideUserAuthentication( registry );
				provideUserCapabilities( registry );
				provideKeyMetrics( registry, { widgetSlugs: [ 'metricA' ] } );
			};

			return (
				<WithRegistrySetup func={ setupRegistry }>
					<Story />
				</WithRegistrySetup>
			);
		},
	],
};
