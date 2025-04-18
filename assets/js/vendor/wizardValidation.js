



// .formValidation({
//     framework: 'bootstrap',
//     icon: {
//         valid: 'glyphicon glyphicon-ok',
//         invalid: 'glyphicon glyphicon-remove',
//         validating: 'glyphicon glyphicon-refresh'
//     },
//     // This option will not ignore invisible fields which belong to inactive panels
//     excluded: ':disabled',
//     fields: {
//         username: {
//             validators: {
//                 notEmpty: {
//                     message: 'The username is required'
//                 },
//                 stringLength: {
//                     min: 6,
//                     max: 30,
//                     message: 'The username must be more than 6 and less than 30 characters long'
//                 },
//                 regexp: {
//                     regexp: /^[a-zA-Z0-9_\.]+$/,
//                     message: 'The username can only consist of alphabetical, number, dot and underscore'
//                 }
//             }
//         },
//         email: {
//             validators: {
//                 notEmpty: {
//                     message: 'The email address is required'
//                 },
//                 emailAddress: {
//                     message: 'The input is not a valid email address'
//                 }
//             }
//         },
//         password: {
//             validators: {
//                 notEmpty: {
//                     message: 'The password is required'
//                 },
//                 different: {
//                     field: 'username',
//                     message: 'The password cannot be the same as username'
//                 }
//             }
//         },
//         confirmPassword: {
//             validators: {
//                 notEmpty: {
//                     message: 'The confirm password is required'
//                 },
//                 identical: {
//                     field: 'password',
//                     message: 'The confirm password must be the same as original one'
//                 }
//             }
//         },
//         firstName: {
//             row: '.col-xs-4',
//             validators: {
//                 notEmpty: {
//                     message: 'The first name is required'
//                 },
//                 regexp: {
//                     regexp: /^[a-zA-Z\s]+$/,
//                     message: 'The first name can only consist of alphabetical and space'
//                 }
//             }
//         },
//         lastName: {
//             row: '.col-xs-4',
//             validators: {
//                 notEmpty: {
//                     message: 'The last name is required'
//                 },
//                 regexp: {
//                     regexp: /^[a-zA-Z\s]+$/,
//                     message: 'The last name can only consist of alphabetical and space'
//                 }
//             }
//         },
//         gender: {
//             validators: {
//                 notEmpty: {
//                     message: 'The gender is required'
//                 }
//             }
//         },
//         dob: {
//             validators: {
//                 notEmpty: {
//                     message: 'The birthday is required'
//                 },
//                 date: {
//                     format: 'YYYY/MM/DD',
//                     message: 'The birthday is not valid'
//                 }
//             }
//         },
//         bio: {
//             validators: {
//                 stringLength: {
//                     max: 200,
//                     message: 'The bio must be less than 200 characters'
//                 }
//             }
//         }
//     }
// });