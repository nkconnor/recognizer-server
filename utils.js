/*
 ***** BEGIN LICENSE BLOCK *****
 
 This file is part of the Zotero Data Server.
 
 Copyright © 2018 Center for History and New Media
 George Mason University, Fairfax, Virginia, USA
 http://zotero.org
 
 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.
 
 You should have received a copy of the GNU Affero General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 
 ***** END LICENSE BLOCK *****
 */

const XRegExp = require('xregexp');
const cld = require('cld');

/**
 * Decomposes all accents and ligatures,
 * filters out symbols that aren't alphabetic,
 * and lowercases alphabetic symbols.
 * @param text
 * @return {string | *}
 */
exports.normalize = function (text) {
	let rx = XRegExp('[^\\pL]', 'g');
	text = XRegExp.replace(text, rx, '');
	text = text.normalize('NFKD');
	text = XRegExp.replace(text, rx, '');
	text = text.toLowerCase();
	return text;
};

/**
 * Run Compact Language Detector
 * @param text
 * @return {Promise<any>}
 */
exports.detectLanguage = function (text) {
	return new Promise(function (resolve, reject) {
		cld.detect(text, function (err, result) {
			resolve(result);
		});
	});
};

// https://stackoverflow.com/a/5515960
exports.byteLength = function (str) {
	// Matches only the 10.. bytes that are non-initial characters in a multi-byte sequence.
	let m = encodeURIComponent(str).match(/%[89ABab]/g);
	return str.length + (m ? m.length : 0);
};

// https://stackoverflow.com/a/23161438
exports.isValidIsbn = function (str) {
	let sum, weight, digit, check, i;
	
	str = str.replace(/[^0-9X]/gi, '');
	
	if (str.length != 10 && str.length != 13) {
		return false;
	}
	
	if (str.length == 13) {
		sum = 0;
		for (i = 0; i < 12; i++) {
			digit = parseInt(str[i]);
			if (i % 2 == 1) {
				sum += 3 * digit;
			}
			else {
				sum += digit;
			}
		}
		check = (10 - (sum % 10)) % 10;
		return (check == str.slice(-1));
	}
	
	if (str.length == 10) {
		weight = 10;
		sum = 0;
		for (i = 0; i < 9; i++) {
			digit = parseInt(str[i]);
			sum += weight * digit;
			weight--;
		}
		check = 11 - (sum % 11);
		if (check == 10) {
			check = 'X';
		}
		return (check == str.slice(-1).toUpperCase());
	}
};

exports.isUpper = function (c) {
	if (!c) return false;
	return c === c.toString().toUpperCase() && XRegExp('\\p{Letter}').test(c)
};

exports.isBreakSection = function (lineText) {
	let breakSections = [
		'introduction',
		'contents',
		'tableofcontent',
		'tableofcontents'
	];
	return lineText && lineText[0] === lineText[0].toUpperCase() &&
		breakSections.includes(lineText.replace(/[^A-Za-z]/g, '').toLowerCase());
};

exports.getTopValue = function (items) {
	let obj = {};
	for (let item of items) {
		obj[item.key] = item.value + (obj[item.key] || 0);
	}
	
	let top = 0;
	let topCount = 0;
	for (let key in obj) {
		let value = obj[key];
		key = parseFloat(key);
		if (value > topCount) {
			top = key;
			topCount = value;
		}
	}
	return top;
};
