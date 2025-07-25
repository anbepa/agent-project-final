/** Polyfills for legacy browsers **/

// Angular relies on Zone.js for change detection. Without importing it the
// application fails to bootstrap and shows the NG0908 error.  Including the
// library here ensures Angular patches async APIs properly.
import 'zone.js';

