/**
 * Library file used to store HTTP Status Codes.
 * @module lib/http_constants
 */


/**
 * 2xx Success Status Codes
 */
/** @constant {number} */
exports.OK_200 = 200;
/** @constant {number} */
exports.STAT_200_OK = exports.OK_200;
/** @constant {number} */
exports.CREATED_201 = 201;
/** @constant {number} */
exports.STAT_201_CREATED = exports.CREATED_201;
/** @constant {number} */
exports.ACCEPTED_202 = 202;
/** @constant {number} */
exports.STAT_202_ACCEPTED = exports.ACCEPTED_202;
/** @constant {number} */
exports.NON_AUTHORITATIVE_INFORMATION_203 = 203;
/** @constant {number} */
exports.STAT_203_NON_AUTHORITATIVE_INFORMATION = exports.NON_AUTHORITATIVE_INFORMATION_203;
/** @constant {number} */
exports.NO_CONTENT_204 = 204;
/** @constant {number} */
exports.STAT_204_NO_CONTENT = exports.NO_CONTENT_204;
/** @constant {number} */
exports.RESET_CONTENT_205 = 205;
/** @constant {number} */
exports.STAT_205_RESET_CONTENT = exports.RESET_CONTENT_205;
/** @constant {number} */
exports.PARTIAL_CONTENT_206 = 206;
/** @constant {number} */
exports.STAT_206_PARTIAL_CONTENT = exports.PARTIAL_CONTENT_206;
/** @constant {number} */
exports.MULTI_STATUS_207 = 207;
/** @constant {number} */
exports.STAT_207_MULTI_STATUS = exports.MULTI_STATUS_207;
/** @constant {number} */
exports.ALREADY_REPORTED_208 = 208;
/** @constant {number} */
exports.STAT_208_ALREADY_REPORTED = exports.ALREADY_REPORTED_208;
/** @constant {number} */
exports.IM_USED_226 = 226;
/** @constant {number} */
exports.STAT_226_IM_USED = exports.IM_USED_226;

/**
 * 3xx Redirection Status Codes
 */
/** @constant {number} */
exports.MOVED_PERMANENTLY_301 = 301;
/** @constant {number} */
exports.STAT_301_MOVED_PERMANENTLY = exports.MOVED_PERMANENTLY_301;
/** @constant {number} */
exports.FOUND_302 = 302;
/** @constant {number} */
exports.STAT_302_FOUND = exports.FOUND_302;
/** @constant {number} */
exports.SEE_OTHER_303 = 303;
/** @constant {number} */
exports.STAT_303_SEE_OTHER = exports.SEE_OTHER_303;
/** @constant {number} */
exports.NOT_MODIFIED_304 = 304;
/** @constant {number} */
exports.STAT_304_NOT_MODIFIED = exports.NOT_MODIFIED_304;
/** @constant {number} */
exports.USE_PROXY_305 = 305;
/** @constant {number} */
exports.STAT_305_USE_PROXY = exports.USE_PROXY_305;
/** @constant {number} */
exports.MOVED_TEMP_REDIRECT_307 = 307;
/** @constant {number} */
exports.STAT_307_MOVED_TEMP_REDIRECT = exports.MOVED_TEMP_REDIRECT_307;
/** @constant {number} */
exports.MOVED_PERMANENT_REDIRECT_EXPERIMENTAL_308 = 308;
/** @constant {number} */
exports.STAT_308_MOVED_PERMANENT_REDIRECT_EXPERIMENTAL = exports.MOVED_PERMANENT_REDIRECT_EXPERIMENTAL_308;
/** @constant {number} */

/**
 * 4xx Client Error Status Codes
 */
/** @constant {number} */
exports.BAD_REQUEST_400 = 400;
/** @constant {number} */
exports.STAT_400_BAD_REQUEST = exports.BAD_REQUEST_400;
/** @constant {number} */
exports.UNAUTHORIZED_401 = 401;
/** @constant {number} */
exports.STAT_401_UNAUTHORIZED = exports.UNAUTHORIZED_401;
/** @constant {number} */
exports.PAYMENT_REQUIRED_402 = 402;
/** @constant {number} */
exports.STAT_402_PAYMENT_REQUIRED = exports.PAYMENT_REQUIRED_402;
/** @constant {number} */
exports.FORBIDDEN_403 = 403;
/** @constant {number} */
exports.STAT_403_FORBIDDEN = exports.FORBIDDEN_403;
/** @constant {number} */
exports.NOT_FOUND_404 = 404;
/** @constant {number} */
exports.STAT_404_NOT_FOUND = exports.NOT_FOUND_404;
/** @constant {number} */
exports.NOT_ALLOWED_405 = 405;
/** @constant {number} */
exports.STAT_405_NOT_ALLOWED = exports.NOT_ALLOWED_405;
/** @constant {number} */
exports.NOT_ACCEPTABLE_406 = 406;
/** @constant {number} */
exports.STAT_406_NOT_ACCEPTABLE = exports.NOT_ACCEPTABLE_406;
/** @constant {number} */
exports.REQUEST_TIMEOUT_408 = 408;
/** @constant {number} */
exports.STAT_408_REQUEST_TIMEOUT = exports.REQUEST_TIMEOUT_408;
/** @constant {number} */
exports.CONFLICT_409 = 409;
/** @constant {number} */
exports.STAT_409_CONFLICT = exports.CONFLICT_409;
/** @constant {number} */
exports.PRECONDITION_FAILED_412 = 412;
/** @constant {number} */
exports.STAT_412_PRECONDITION_FAILED = exports.PRECONDITION_FAILED_412;
/** @constant {number} */
exports.UNSUPPORTED_MEDIA_TYPE_415 = 415;
/** @constant {number} */
exports.STAT_415_UNSUPPORTED_MEDIA_TYPE = exports.UNSUPPORTED_MEDIA_TYPE_415;
/** @constant {number} */
exports.EXPECTATION_FAILED_417 = 417;
/** @constant {number} */
exports.STAT_417_EXPECTATION_FAILED = exports.EXPECTATION_FAILED_417;
/** @constant {number} */
exports.IM_A_TEAPOT_418 = 418;
/** @constant {number} */
exports.STAT_418_IM_A_TEAPOT = exports.IM_A_TEAPOT_418;
/** @constant {number} */
exports.PRECONDITION_REQUIRED_428 = 428;
/** @constant {number} */
exports.STAT_428_PRECONDITION_REQUIRED = exports.PRECONDITION_REQUIRED_428;

/**
 * 5xx Server Error Status Codes
 */
/** @constant {number} */
exports.INTERNAL_SERVER_ERROR_500 = 500;
/** @constant {number} */
exports.STAT_500_INTERNAL_SERVER_ERROR = exports.INTERNAL_SERVER_ERROR_500;
/** @constant {number} */
exports.NOT_IMPLEMENTED_ON_SERVER_501 = 501;
/** @constant {number} */
exports.STAT_501_NOT_IMPLEMENTED_ON_SERVER = exports.NOT_IMPLEMENTED_ON_SERVER_501;
