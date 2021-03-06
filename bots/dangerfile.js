/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * To test Danger during development, run yarn in this directory, then run:
 * $ yarn danger pr <URL to GitHub PR>
 *
 * @format
 */

'use strict';

const includes = require('lodash.includes');

const {danger, fail, warn} = require('danger');

// Warns if a summary section is missing, or body is too short
const includesSummary =
  danger.github.pr.body &&
  danger.github.pr.body.toLowerCase().includes('## summary');
if (!danger.github.pr.body || danger.github.pr.body.length < 50) {
  fail(':grey_question: This pull request needs a description.');
} else if (!includesSummary) {
  const title = ':clipboard: Missing Summary';
  const idea =
    'Can you add a Summary? ' +
    'To do so, add a "## Summary" section to your PR description. ' +
    'This is a good place to explain the motivation for making this change.';
  warn(`${title} - <i>${idea}</i>`);
}

// Warns if there are changes to package.json, and tags the team.
const packageChanged = includes(danger.git.modified_files, 'package.json');
if (packageChanged) {
  const title = ':lock: package.json';
  const idea =
    'Changes were made to package.json. ' +
    'This will require a manual import by a Facebook employee.';
  warn(`${title} - <i>${idea}</i>`);
}

// Warns if a test plan is missing.
const includesTestPlan =
  danger.github.pr.body &&
  danger.github.pr.body.toLowerCase().includes('## test plan');
if (!includesTestPlan) {
  const title = ':clipboard: Missing Test Plan';
  const idea =
    'Can you add a Test Plan? ' +
    'To do so, add a "## Test Plan" section to your PR description. ' +
    'A Test Plan lets us know how these changes were tested.';
  warn(`${title} - <i>${idea}</i>`);
}

// Regex looks for given categories, types, a file/framework/component, and a message - broken into 4 capture groups
const changelogRegex = /\[\s?(ANDROID|GENERAL|IOS)\s?\]\s*?\[\s?(ADDED|CHANGED|DEPRECATED|REMOVED|FIXED|SECURITY)\s?\]\s*?\-?\s*?(.*)/gi;
const includesChangelog =
  danger.github.pr.body &&
  (danger.github.pr.body.toLowerCase().includes('## changelog') ||
    danger.github.pr.body.toLowerCase().includes('release notes'));
const correctlyFormattedChangelog = changelogRegex.test(danger.github.pr.body);

const changelogInstructions =
  'A changelog entry has the following format: [`[CATEGORY] [TYPE] - Message`](http://facebook.github.io/react-native/docs/contributing#changelog).';
if (!includesChangelog) {
  const title = ':clipboard: Missing Changelog';
  const idea =
    'Can you add a Changelog? ' +
    'To do so, add a "## Changelog" section to your PR description. ' +
    changelogInstructions;
  warn(`${title} - <i>${idea}</i>`);
} else if (!correctlyFormattedChangelog) {
  const title = ':clipboard: Changelog Format';
  const idea = 'Did you include a Changelog? ' + changelogInstructions;
  warn(`${title} - <i>${idea}</i>`);
}

// Warns if the PR is opened against stable, as commits need to be cherry picked and tagged by a release maintainer.
// Fails if the PR is opened against anything other than `master` or `-stable`.
const isMergeRefMaster = danger.github.pr.base.ref === 'master';
const isMergeRefStable = danger.github.pr.base.ref.indexOf('-stable') !== -1;
if (!isMergeRefMaster && isMergeRefStable) {
  const title = ':grey_question: Base Branch';
  const idea =
    'The base branch for this PR is something other than `master`. Are you sure you want to merge these changes into a stable release? If you are interested in backporting updates to an older release, the suggested approach is to land those changes on `master` first and then cherry-pick the commits into the branch for that release. The [Releases Guide](https://github.com/facebook/react-native/blob/master/Releases.md) has more information.';
  warn(`${title} - <i>${idea}</i>`);
} else if (!isMergeRefMaster && !isMergeRefStable) {
  const title = ':exclamation: Base Branch';
  const idea =
    'The base branch for this PR is something other than `master`. [Are you sure you want to target something other than the `master` branch?](http://facebook.github.io/react-native/docs/contributing.html#pull-requests)';
  fail(`${title} - <i>${idea}</i>`);
}
