"use strict";

// gmail.js needs to be loaded as early as possible to be able to intercept
// embedded email-data in the gmail HTML!
//
// To do that we:
// - just load it
// - make sure it's initialized

const GmailFactory = require("gmail-js");
import $ from "jquery";

// trusted types catch all for all non-jquery html (specficially, add_compose_button)
if (window.trustedTypes && window.trustedTypes.createPolicy) {
  window.trustedTypes.createPolicy("default", {
    createHTML: (string) => string,
    createScriptURL: (string) => string,
    createScript: (string) => string,
  });
}

/* // trusted types catch all for all jquery html
const trustedHTMLpolicy = trustedTypes.createPolicy("default", {
  createHTML: (to_escape) => to_escape,
});

$.extend({
  htmlPrefilter: trustedHTMLpolicy.createHTML, // this is the actual function which jQuery needs
}); */

// handling multiple gmailjs instances at the same time
window._gmailjs = window._gmailjs || new GmailFactory.Gmail($);
