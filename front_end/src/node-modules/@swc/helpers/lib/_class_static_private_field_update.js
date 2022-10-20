"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = _classStaticPrivateFieldUpdate;
var _classCheckPrivateStaticAccessMjs = _interopRequireDefault(require("./_class_check_private_static_access.js"));
var _classCheckPrivateStaticFieldDescriptorMjs = _interopRequireDefault(require("./_class_check_private_static_field_descriptor.js"));
var _classApplyDescriptorUpdateMjs = _interopRequireDefault(require("./_class_apply_descriptor_update.js"));
function _classStaticPrivateFieldUpdate(receiver, classConstructor, descriptor) {
    (0, _classCheckPrivateStaticAccessMjs).default(receiver, classConstructor);
    (0, _classCheckPrivateStaticFieldDescriptorMjs).default(descriptor, "update");
    return (0, _classApplyDescriptorUpdateMjs).default(receiver, descriptor);
}
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
