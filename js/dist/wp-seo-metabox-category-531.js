(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/* global wp, _, wpseoPrimaryCategoryL10n */
(function ($) {
	"use strict";

	var primaryTermInputTemplate, primaryTermUITemplate, primaryTermScreenReaderTemplate;
	var taxonomies = wpseoPrimaryCategoryL10n.taxonomies;

	/**
  * Checks if the elements to make a term the primary term and the display for a primary term exist.
  *
  * @param {Object} checkbox The checkbox to get the closest required fields for.
  *
  * @returns {boolean} True when there are primary elements.
  */
	function hasPrimaryTermElements(checkbox) {
		return 1 === $(checkbox).closest("li").children(".wpseo-make-primary-term").length;
	}

	/**
  * Retrieves the primary term for a taxonomy.
  *
  * @param {string} taxonomyName The taxonomy name.
  *
  * @returns {string} The value of the primary term.
  */
	function getPrimaryTerm(taxonomyName) {
		var primaryTermInput;

		primaryTermInput = $("#yoast-wpseo-primary-" + taxonomyName);
		return primaryTermInput.val();
	}

	/**
  * Sets the primary term for a taxonomy.
  *
  * @param {string} taxonomyName The taxonomy name.
  * @param {string} termId       The term id.
  *
  * @returns {void}
  */
	function setPrimaryTerm(taxonomyName, termId) {
		var primaryTermInput;

		primaryTermInput = $("#yoast-wpseo-primary-" + taxonomyName);
		primaryTermInput.val(termId).trigger("change");
	}

	/**
  * Creates the elements necessary to show something is a primary term or to make it the primary term.
  *
  * @param {string} taxonomyName The taxonomy name.
  * @param {Object} checkbox     The checkbox to get label for.
  *
  * @returns {void}
  */
	function createPrimaryTermElements(taxonomyName, checkbox) {
		var label, html;

		label = $(checkbox).closest("label");

		html = primaryTermUITemplate({
			taxonomy: taxonomies[taxonomyName],
			term: label.text()
		});

		label.after(html);
	}

	/**
  * Updates the primary term selectors/indicators for a certain taxonomy.
  *
  * @param {string} taxonomyName The taxonomy name.
  *
  * @returns {void}
  */
	function updatePrimaryTermSelectors(taxonomyName) {
		var checkedTerms;
		var listItem, label;

		checkedTerms = $("#" + taxonomyName + 'checklist input[type="checkbox"]:checked');

		var taxonomyListItem = $("#" + taxonomyName + "checklist li");
		taxonomyListItem.removeClass("wpseo-term-unchecked wpseo-primary-term wpseo-non-primary-term");

		$(".wpseo-primary-category-label").remove();
		taxonomyListItem.addClass("wpseo-term-unchecked");

		// If there is only one term selected we don't want to show our interface.
		if (checkedTerms.length <= 1) {
			return;
		}

		checkedTerms.each(function (i, term) {
			term = $(term);
			listItem = term.closest("li");
			listItem.removeClass("wpseo-term-unchecked");

			// Create our interface elements if they don't exist.
			if (!hasPrimaryTermElements(term)) {
				createPrimaryTermElements(taxonomyName, term);
			}

			if (term.val() === getPrimaryTerm(taxonomyName)) {
				listItem.addClass("wpseo-primary-term");

				label = term.closest("label");
				label.find(".wpseo-primary-category-label").remove();
				label.append(primaryTermScreenReaderTemplate({
					taxonomy: taxonomies[taxonomyName]
				}));
			} else {
				listItem.addClass("wpseo-non-primary-term");
			}
		});
	}

	/**
  * Makes the first term primary for a certain taxonomy.
  *
  * @param {string} taxonomyName The taxonomy name.
  *
  * @returns {void}
  */
	function makeFirstTermPrimary(taxonomyName) {
		var firstTerm = $("#" + taxonomyName + 'checklist input[type="checkbox"]:checked:first');

		setPrimaryTerm(taxonomyName, firstTerm.val());
		updatePrimaryTermSelectors(taxonomyName);
	}

	/**
  * If we check a term while there is no primary term we make that one the primary term.
  *
  * @param {string} taxonomyName The taxonomy name.
  *
  * @returns {void}
  */
	function ensurePrimaryTerm(taxonomyName) {
		if ("" === getPrimaryTerm(taxonomyName)) {
			makeFirstTermPrimary(taxonomyName);
		}
	}

	/**
  * Returns the term checkbox handler for a certain taxonomy name.
  *
  * @param {string} taxonomyName The taxonomy name.
  *
  * @returns {Function} Event handler for the checkbox.
  */
	function termCheckboxHandler(taxonomyName) {
		return function () {
			// If the user unchecks the primary category we have to select any new primary term
			if (false === $(this).prop("checked") && $(this).val() === getPrimaryTerm(taxonomyName)) {
				makeFirstTermPrimary(taxonomyName);
			}

			ensurePrimaryTerm(taxonomyName);

			updatePrimaryTermSelectors(taxonomyName);
		};
	}

	/**
  * Returns the term list add handler for a certain taxonomy name.
  *
  * @param {string} taxonomyName The taxonomy name.
  *
  * @returns {Function} The term list add handler.
  */
	function termListAddHandler(taxonomyName) {
		return function () {
			ensurePrimaryTerm(taxonomyName);
			updatePrimaryTermSelectors(taxonomyName);
		};
	}

	/**
  * Returns the make primary event handler for a certain taxonomy name.
  *
  * @param {string} taxonomyName The taxonomy name.
  *
  * @returns {Function} The event handler.
  */
	function makePrimaryHandler(taxonomyName) {
		return function (e) {
			var term, checkbox;

			term = $(e.currentTarget);
			checkbox = term.siblings("label").find("input");

			setPrimaryTerm(taxonomyName, checkbox.val());

			updatePrimaryTermSelectors(taxonomyName);

			// The clicked link will be hidden so we need to focus something different.
			checkbox.focus();
		};
	}

	$.fn.initYstSEOPrimaryCategory = function () {
		return this.each(function (i, taxonomy) {
			var metaboxTaxonomy, html;

			metaboxTaxonomy = $("#" + taxonomy.name + "div");

			html = primaryTermInputTemplate({
				taxonomy: taxonomy
			});

			metaboxTaxonomy.append(html);

			updatePrimaryTermSelectors(taxonomy.name);

			metaboxTaxonomy.on("click", 'input[type="checkbox"]', termCheckboxHandler(taxonomy.name));

			// When the AJAX Request is done, this event will be fired.
			metaboxTaxonomy.on("wpListAddEnd", "#" + taxonomy.name + "checklist", termListAddHandler(taxonomy.name));

			metaboxTaxonomy.on("click", ".wpseo-make-primary-term", makePrimaryHandler(taxonomy.name));
		});
	};

	$(function () {
		// Initialize our templates
		primaryTermInputTemplate = wp.template("primary-term-input");
		primaryTermUITemplate = wp.template("primary-term-ui");
		primaryTermScreenReaderTemplate = wp.template("primary-term-screen-reader");

		$(_.values(taxonomies)).initYstSEOPrimaryCategory();
	});
})(jQuery);

},{}]},{},[1]);
