/**
 * Tag Manager Form Instructions component.
 *
 * Site Kit by Google, Copyright 2021 Google LLC
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
import { __, sprintf } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Data from 'googlesitekit-data';
import { CORE_SITE } from '../../../../googlesitekit/datastore/site/constants';
import { CORE_MODULES } from '../../../../googlesitekit/modules/datastore/constants';
import { MODULES_TAGMANAGER } from '../../datastore/constants';
import { MODULES_ANALYTICS } from '../../../analytics/datastore/constants';
import ErrorText from '../../../../components/ErrorText';
const { useSelect } = Data;

export default function FormInstructions() {
	const hasExistingTag = useSelect( ( select ) =>
		select( MODULES_TAGMANAGER ).hasExistingTag()
	);
	const isSecondaryAMP = useSelect( ( select ) =>
		select( CORE_SITE ).isSecondaryAMP()
	);
	const singleAnalyticsPropertyID = useSelect( ( select ) =>
		select( MODULES_TAGMANAGER ).getSingleAnalyticsPropertyID()
	);
	const hasMultipleAnalyticsPropertyIDs = useSelect( ( select ) =>
		select( MODULES_TAGMANAGER ).hasMultipleAnalyticsPropertyIDs()
	);
	const analyticsPropertyID = useSelect( ( select ) =>
		select( MODULES_ANALYTICS ).getPropertyID()
	);
	const analyticsModuleActive = useSelect( ( select ) =>
		select( CORE_MODULES ).isModuleActive( 'analytics' )
	);

	const containerID = useSelect( ( select ) =>
		select( MODULES_TAGMANAGER ).getExistingTag()
	);

	// Multiple property IDs implies secondary AMP where selected containers don't reference the same Analytics property ID.
	if ( hasMultipleAnalyticsPropertyIDs ) {
		const message = __(
			'Looks like you’re already using Google Analytics within your Google Tag Manager configurations. However, the configured Analytics tags reference different property IDs, or the setup process was not fully completed. You need to configure the same Analytics property in both containers.',
			'google-site-kit'
		);

		return <ErrorText message={ message } />;
	}

	// If the Analytics property ID in the container(s) matches
	// the property ID configured for the Analytics module,
	// inform the user that Tag Manager will take over outputting the tag/snippet.
	if (
		analyticsModuleActive &&
		singleAnalyticsPropertyID &&
		singleAnalyticsPropertyID === analyticsPropertyID
	) {
		return (
			<p>
				{ sprintf(
					/* translators: %s: Analytics property ID */
					__(
						'Looks like you’re using Google Analytics. Your Analytics property %s is already set up in your Google Tag Manager configuration, so Site Kit will switch to using Google Tag Manager for Analytics.',
						'google-site-kit'
					),
					singleAnalyticsPropertyID
				) }
			</p>
		);
	}

	// If the Analytics module is not active, and selected containers reference a singular property ID,
	// recommend continuing with Analytics setup.
	if ( ! analyticsModuleActive && singleAnalyticsPropertyID ) {
		return (
			<p>
				{ __(
					'Looks like you’re already using Google Analytics within your Google Tag Manager configuration. Activate the Google Analytics module in Site Kit to see relevant insights in your dashboard.',
					'google-site-kit'
				) }
			</p>
		);
	}

	if ( hasExistingTag ) {
		return (
			<p>
				{ sprintf(
					// translators: %s: the existing container ID.
					__(
						'An existing tag was found on your site (%s). If you later decide to replace this tag, Site Kit can place the new tag for you. Make sure you remove the old tag first.',
						'google-site-kit'
					),
					containerID
				) }
			</p>
		);
	}

	if ( isSecondaryAMP ) {
		return (
			<p>
				{ __(
					'Looks like your site is using paired AMP. Please select your Tag Manager account and relevant containers below, the snippets will be inserted automatically on your site.',
					'google-site-kit'
				) }
			</p>
		);
	}

	return (
		<p>
			{ __(
				'Please select your Tag Manager account and container below, the snippet will be inserted automatically on your site.',
				'google-site-kit'
			) }
		</p>
	);
}
