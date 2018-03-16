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

exports.normalize = function (text) {
	let rx = XRegExp('[^\\pL]', 'g');
	text = XRegExp.replace(text, rx, '');
	text = text.normalize('NFKD');
	text = XRegExp.replace(text, rx, '');
	text = text.toLowerCase();
	return text;
};

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
