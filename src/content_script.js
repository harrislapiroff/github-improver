import 'babel-polyfill'
import 'whatwg-fetch' // fetch polyfill

import Drop from 'tether-drop'
import '~/modules/popover/popover.scss'

const DATASET_NAMESPACE = 'chrGitHub'
const ISSUE_LINK_REGEX = new RegExp("(https?://(www.)?github.com)?/([^/]+)/([^/]+)/(issues|pull)/([0-9]+).*")
const ISSUE_POPOVER_TEMPLATE = (link, title, number, description) => (`
	<div class="chr-drop-wrap">
		<div class="drop-header">
			<a class="chr-title" href="${link}">${title}</a>
			<span class="chr-number">${number}</span>
		</div>
		<div class="drop-body">${description}</div>
	</div>
`)
const domParser = new DOMParser();


function handleContentLoad(data, drop) {
	const issueDocument = domParser.parseFromString(data, 'text/html')
	const issueTitle = issueDocument.getElementsByClassName('js-issue-title')[0].innerHTML
	// Assume the first comment body is an issue description
	const issueNumber = issueDocument.getElementsByClassName('gh-header-number')[0].innerHTML
	const issueDescription = issueDocument.getElementsByClassName('comment-body')[0].innerHTML
	drop.content.innerHTML = ISSUE_POPOVER_TEMPLATE(data.finalUrl, issueTitle, issueNumber, issueDescription)
	drop.content.classList.remove('chr-loading')
	drop.loadedOnce = true
	// Clear the title to prevent conflicting hover behavior
	drop.target.title = ''
	// Reposition the drop
	drop.position()
}

function handlePopover() {
	const drop = this
	if (!drop.loadedOnce) drop.content.classList.add('chr-loading')
	fetch(this.target.href, { credentials: 'include' })
		.then((r) => r.text())
		.then((r) => handleContentLoad(r, drop))
}

function createIssuePopovers() {
	// Get all the links on the page
	const links = document.getElementsByTagName('a')
	// Filter down to the links that are issue links
	const issueLinks = Array.filter(links, (l) => ISSUE_LINK_REGEX.test(l.href))
	// For each issue link, create a popover
	issueLinks.forEach((l) => {

		// Short circuit if we've already instantiated on this link
		if (l.dataset[DATASET_NAMESPACE]) return
		// or if the link is already within a popover
		if (l.classList.contains('chr-title')) return
		// or if the link is the same as the current page
		if (l.pathname === window.location.pathname) return

		// Otherwise, create a new Drop
		const drop = new Drop({
			target: l,
			content: '<div class="chr-loader"></div>',
			openOn: 'hover',
			classes: 'chr-theme',
			position: 'bottom center',
		})
		drop.on('open', handlePopover)
		drop.loadedOnce = false
		// Mark that we've instantiated on this link
		l.dataset[DATASET_NAMESPACE] = true

	})
}

const observer = new MutationObserver(createIssuePopovers)
observer.observe(document.body, { childList: true, subtree: true })

createIssuePopovers()
