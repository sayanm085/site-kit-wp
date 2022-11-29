/**
 * Tests for User Input Validation Utilities.
 *
 * Site Kit by Google, Copyright 2022 Google LLC
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

import { getErrorMessageForAnswer, getValidValues } from './validation';

describe( 'User Input Validation Utilities', () => {
	describe( 'getValidValues', () => {
		it( 'should return a list of trimmed, non-empty values from the passed string array', () => {
			expect( getValidValues( [ '  ', 'test1', '  test2  ' ] ) ).toEqual(
				[ 'test1', 'test2' ]
			);
		} );
	} );

	describe( 'getErrorMessageForAnswer', () => {
		it( 'should return the correct error message for the given answer when max is 1, or null if the answer is valid', () => {
			// Max defaults to 1.
			expect( getErrorMessageForAnswer( [] ) ).toBe(
				'Please select an answer'
			);

			// Explicitly set max to 1.
			expect( getErrorMessageForAnswer( [], 1 ) ).toBe(
				'Please select an answer'
			);
		} );

		it( 'should return the correct error message for the given answer when max is greater than 1', () => {
			expect( getErrorMessageForAnswer( [], 2 ) ).toBe(
				'Please select at least 1 answer'
			);

			expect( getErrorMessageForAnswer( [], 100 ) ).toBe(
				'Please select at least 1 answer'
			);
		} );

		it( 'should return the correct error message for the given answer when there is an empty value', () => {
			expect( getErrorMessageForAnswer( [ '  ', 'test' ] ) ).toBe(
				'Please select a valid answer'
			);
		} );

		it( 'should return null if the answer is valid', () => {
			expect( getErrorMessageForAnswer( [ 'test' ] ) ).toBeNull();
		} );
	} );
} );
