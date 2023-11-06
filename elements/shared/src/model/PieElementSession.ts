/**
 * Base interface for all Pie Elements session data. This always represents the *current* answer/ selection
 * of the user.
 *
 * Session contents are always specific to the element and the model it is using. The element is responsible
 * for defining the session data structure and using it appropriately for the outcome function.
 *
 * For instance:
 *
 * `{ id: 'p-00000000', value: [ '0' ] }`
 *
 * and
 *
 * `{ id: 'p-00000000', answers: [{ category: '0', choices: ['0'] }, { category: '1', choices: ['3'] } ] }`
 *
 *  are both valid session data for different elements.
 */
export interface PieElementSession {

    /** The unique id of the element session */
    id: string;

    /** The unique element (DOM) name */
    element?: string;

    [key: string]: unknown; // allow additional properties;
}
