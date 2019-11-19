<?php
/**
 * Site_VerificationTest
 *
 * @package   Google\Site_Kit
 * @copyright 2019 Google LLC
 * @license   https://www.apache.org/licenses/LICENSE-2.0 Apache License 2.0
 * @link      https://sitekit.withgoogle.com
 */

namespace Google\Site_Kit\Tests\Modules;

use Google\Site_Kit\Context;
use Google\Site_Kit\Core\Authentication\Authentication;
use Google\Site_Kit\Core\Modules\Module_With_Scopes;
use Google\Site_Kit\Modules\Site_Verification;
use Google\Site_Kit\Tests\Core\Modules\Module_With_Scopes_ContractTests;
use Google\Site_Kit\Tests\TestCase;

/**
 * @group Modules
 */
class Site_VerificationTest extends TestCase {
	use Module_With_Scopes_ContractTests;

	public function test_magic_methods() {
		$site_verification = new Site_Verification( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );

		$this->assertEquals( 'site-verification', $site_verification->slug );
		$this->assertTrue( $site_verification->force_active );
		$this->assertTrue( $site_verification->internal );
		$this->assertEquals( 'https://www.google.com/webmasters/verification/home', $site_verification->homepage );
	}

	public function test_register() {
		$site_verification = new Site_Verification( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );

		remove_all_filters( 'googlesitekit_auth_scopes' );
		remove_all_filters( 'admin_init' );

		$this->assertEmpty( apply_filters( 'googlesitekit_auth_scopes', array() ) );

		$site_verification->register();

		// Test registers scopes.
		$this->assertEquals(
			$site_verification->get_scopes(),
			apply_filters( 'googlesitekit_auth_scopes', array() )
		);
		$this->assertTrue( has_action( 'admin_init' ) );
	}

	/**
	 * @dataProvider data_register_head_verification_tags
	 */
	public function test_register_head_verification_tags( $saved_tag, $expected_output ) {
		remove_all_actions( 'wp_head' );
		remove_all_actions( 'login_head' );
		$site_verification = new Site_Verification( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );
		$site_verification->register();

		set_transient( 'googlesitekit_verification_meta_tags', array( $saved_tag ) );

		$this->assertContains(
			$expected_output,
			$this->capture_action( 'wp_head' )
		);

		$this->assertContains(
			$expected_output,
			$this->capture_action( 'login_head' )
		);
	}

	public function data_register_head_verification_tags() {
		return array(
			array( // Full meta tag stored.
				'<meta name="google-site-verification" content="test-verification-content">',
				'<meta name="google-site-verification" content="test-verification-content">',
			),
			array(
				// Only verification token stored.
				'test-verification-content-2',
				'<meta name="google-site-verification" content="test-verification-content-2">',
			),
		);
	}

	public function test_get_module_scopes() {
		$site_verification = new Site_Verification( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );

		$this->assertEqualSets(
			array(
				'https://www.googleapis.com/auth/siteverification',
			),
			$site_verification->get_scopes()
		);
	}

	/**
	 * @return Module_With_Scopes
	 */
	protected function get_module_with_scopes() {
		return new Site_Verification( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );
	}

	public function test_get_datapoints() {
		$tagmanager = new Site_Verification( new Context( GOOGLESITEKIT_PLUGIN_MAIN_FILE ) );

		$this->assertEqualSets(
			array(
				'verified-sites',
				'verification',
				'verification-token',
			),
			$tagmanager->get_datapoints()
		);
	}
}
