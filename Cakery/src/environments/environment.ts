// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  serviceApi: "http://localhost:9072/api/",
  loginApi: "http://localhost:9072/Token",
  imageApi: "http://localhost:9072/Images/"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

/*
* For production testing (Backend deployed on local IIS)
* 
* serviceApi: "http://192.168.0.101/api/",
* loginApi: "http://192.168.0.101/Token",
* imageApi: "http://192.168.0.101/Images/"
*
*/
