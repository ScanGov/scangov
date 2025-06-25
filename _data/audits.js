import { getData } from '../scripts/getdata.js';

export default async function () {
  let auditsFile = 'https://github.com/ScanGov/data/raw/refs/heads/main/standards/audits.json';

  let getDataLocally = false;
  if(process.env.ELEVENTY_RUN_MODE === 'serve') {
    getDataLocally = true;
  }

  //const auditData = await getData(auditsFile, getDataLocally);

  let auditData = {
  "aifriendly": {
    "displayName": "AI-friendly",
    "icon": "robot",
    "color": "#e6e6e6",
    "url": "/guidance/aifriendly",
    "description": "ScanGov AI-friendly standards and guidance.",
    "attributes": [
      {
        "key": "crawlable",
        "displayName": "Crawlable",
        "tag": "crawlable",
        "description": "Site is available for indexing by well-behaved agents.",
        "why": "Allows AI bots to find and index your pages, helping your content appear in search results and reach more people.",
        "error": "Site is not accessible to well-behaved agents.",
        "impact": 4,
        "guidance": [
          {
            "displayName": "21st Century Integrated Digital Experience Act",
            "url": "/21stcenturyidea"
          },
          {
            "displayName": "Memorandum (M-23-22)",
            "url": "/memorandum-m-23-22"
          },
          {
            "displayName": "The Web Robots Pages",
            "url": "/robots"
          }
        ],
        "userStories": [
          {
            "title": "As an AI bot, I want to be able to crawl and access all relevant content on the website so that I can accurately index and understand the site for providing useful responses to users."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>The <code class=\"language-plaintext highlighter-rouge\">robots.txt</code> file tells AI crawlers and search engines which parts of a website they can or cannot access. This helps website owners control what data is available to AI models while protecting private or sensitive information. It also prevents unnecessary crawling, reducing server load and improving site performance. By following <code class=\"language-plaintext highlighter-rouge\">robots.txt</code> rules, AI crawlers respect website preferences and ensure ethical data collection.</p>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "text-content",
        "displayName": "Content available in document",
        "tag": "text-content",
        "description": "Page main content is available in initial document.",
        "why": "Ensures search engines can read and index the content within a document, making it discoverable and improving visibility online.",
        "error": "Main content not available in the initial document.",
        "impact": 2,
        "guidance": [
          {
            "displayName": "The Web Robots Pages",
            "url": "/robots"
          }
        ],
        "userStories": [
          {
            "title": "As a user or AI bot, I want the content of the website to be accessible and available directly in the document so that I can easily access, read, and index the information without relying on external sources or heavy JavaScript execution."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>The main content of each page is available in the initial document. It does not require a lot of client-side script execution in order to render. If page usually require a lot of client-side script execution to render main content the content may be made available to bots in an alternate text version of the site.</p>"
          }
        },
        "relatedLinks": {}
      }
    ]
  },
  "accessibility": {
    "displayName": "Accessibility",
    "icon": "universal-access",
    "color": "#a8f2ff",
    "url": "/guidance/accessibility",
    "description": "ScanGov accessibility standards and guidance.",
    "attributes": [
      {
        "key": "a11y-best-practices",
        "displayName": "Accessibility best practices",
        "featured": true,
        "tag": "a11y-best-practices",
        "description": "Common accessibility best practices.",
        "why": "Follows guidelines that make websites usable for everyone, including people with disabilities, improving user experience and reach.",
        "error": "Basic accessibility best practices not met.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "Web Content Accessibility Guidelines (WCAG)",
            "url": "/wcag"
          }
        ],
        "userStories": [
          {
            "title": "As a user with a disability, I want the website to be accessible and easy to navigate so that I can access and interact with the content without barriers, regardless of my abilities or the technology I use."
          }
        ],
        "sections": {
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/meta-refresh\">Refresh meta tag</a></li>\n  <li><a href=\"https://standards.scangov.org/viewport-meta-tag\">Viewport meta tag</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/target-size\">Touch targets</a></li>\n</ul>"
          },
          "about": {
            "title": "About",
            "content": "<p>Accessibilty can be improved by passing these tests:</p><ol>\n  <li>\n    <p>The document does not use <code class=\"language-plaintext highlighter-rouge\">&lt;meta http-equiv=\"refresh\"&gt;</code>: Users do not expect a page to refresh automatically, and doing so will move focus back to the top of the page. This may create a frustrating or confusing experience.</p>\n  </li>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">[user-scalable=\"no\"]</code> is not used in the <code class=\"language-plaintext highlighter-rouge\">&lt;meta name=\"viewport\"&gt;</code> element and the <code class=\"language-plaintext highlighter-rouge\">[maximum-scale]</code> attribute is not less than 5: Disabling zooming is problematic for users with low vision who rely on screen magnification to properly see the contents of a web page.</p>\n  </li>\n  <li>\n    <p>Touch targets do not have sufficient size or spacing: Touch targets with sufficient size and spacing help users who may have difficulty targeting small controls to activate the targets.</p>\n  </li>\n</ol>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "a11y-aria",
        "displayName": "ARIA attributes",
        "tag": "a11y-aria",
        "description": "Accessibility properties for screen readers.",
        "why": "Provides extra information for screen readers, helping visually impaired users understand content and navigate websites more easily.",
        "error": "Missing ARIA attributes for screen readers.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "Web Content Accessibility Guidelines (WCAG)",
            "url": "/wcag"
          }
        ],
        "userStories": [
          {
            "title": "As a user with a screen reader, I want the website to provide proper semantic information for dynamic elements, so that I can easily understand their purpose and interact with them without confusion."
          }
        ],
        "sections": {
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-allowed-attr\">How to match ARIA attributes to their roles</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-allowed-role\">About ARIA roles</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-command-name\">How to make command elements more accessible</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-conditional-attr\">About conditional ARIA attributes</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-deprecated-role\">About deprecated ARIA roles</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-dialog-name\">How to make ARIA dialog elements more accessible</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-hidden-body\">How <code class=\"language-plaintext highlighter-rouge\">aria-hidden</code> affects the document body</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-hidden-focus\">How <code class=\"language-plaintext highlighter-rouge\">aria-hidden</code> affects focusable elements</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-input-field-name\">About input field labels</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-meter-name\">How to name <code class=\"language-plaintext highlighter-rouge\">meter</code> elements</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-progressbar-name\">How to label <code class=\"language-plaintext highlighter-rouge\">progressbar</code> elements</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-prohibited-attr\">About prohibited ARIA roles</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-required-attr\">About roles and required attributes</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-required-children\">About roles and required children elements</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-required-parent\">About ARIA roles and required parent element</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-roles\">About valid ARIA roles</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-text\">About the <code class=\"language-plaintext highlighter-rouge\">role=text</code> attribute</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-toggle-field-name\">About toggle fields</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-tooltip-name\">How to name <code class=\"language-plaintext highlighter-rouge\">tooltip</code> elements</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-treeitem-name\">About labeling <code class=\"language-plaintext highlighter-rouge\">treeitem</code> elements</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-valid-attr-value\">About valid values for ARIA attributes</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/aria-valid-attr\">About valid ARIA attributes</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/duplicate-id-aria\">How to fix duplicate ARIA IDs</a></li>\n</ul>"
          },
          "about": {
            "title": "About",
            "content": "<p>These are opportunities to improve the usage of ARIA in your application which may enhance the experience for users of assistive technology, like a screen reader.</p><p>You don't always need <code class=\"language-plaintext highlighter-rouge\">aria-</code> attributes in your application for it to be accessible. When you do use <code class=\"language-plaintext highlighter-rouge\">aria-</code> attributes follow these recommendations to make sure they are helpful.</p><p>Contains:</p><ol>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">[aria-*]</code> attributes match their roles: Each ARIA <code class=\"language-plaintext highlighter-rouge\">role</code> supports a specific subset of <code class=\"language-plaintext highlighter-rouge\">aria-*</code> attributes. Mismatching these invalidates the <code class=\"language-plaintext highlighter-rouge\">aria-*</code> attributes.</p>\n  </li>\n  <li>\n    <p>Uses ARIA roles only on compatible elements: Many HTML elements can only be assigned certain ARIA roles. Using ARIA roles where they are not allowed can interfere with the accessibility of the web page.</p>\n  </li>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">button</code>, <code class=\"language-plaintext highlighter-rouge\">link</code>, and <code class=\"language-plaintext highlighter-rouge\">menuitem</code> elements have accessible names: When an element doesn't have an accessible name, screen readers announce it with a generic name, making it unusable for users who rely on screen readers.</p>\n  </li>\n  <li>\n    <p>ARIA attributes are used as specified for the element's role: Some ARIA attributes are only allowed on an element under certain conditions.</p>\n  </li>\n  <li>\n    <p>Deprecated ARIA roles were not used: Deprecated ARIA roles may not be processed correctly by assistive technology.</p>\n  </li>\n  <li>\n    <p>Elements with <code class=\"language-plaintext highlighter-rouge\">role=\"dialog\"</code> or <code class=\"language-plaintext highlighter-rouge\">role=\"alertdialog\"</code> have accessible names: ARIA dialog elements without accessible names may prevent screen readers users from discerning the purpose of these elements.</p>\n  </li>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">[aria-hidden=\"true\"]</code> is not present on the document <code class=\"language-plaintext highlighter-rouge\">&lt;body&gt;</code>: Assistive technologies, like screen readers, work inconsistently when <code class=\"language-plaintext highlighter-rouge\">aria-hidden=\"true\"</code> is set on the document <code class=\"language-plaintext highlighter-rouge\">&lt;body&gt;</code>.</p>\n  </li>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">[aria-hidden=\"true\"]</code> elements do not contain focusable descendents: Focusable descendents within an <code class=\"language-plaintext highlighter-rouge\">[aria-hidden=\"true\"]</code> element prevent those interactive elements from being available to users of assistive technologies like screen readers.</p>\n  </li>\n  <li>\n    <p>ARIA input fields have accessible names: When an input field doesn't have an accessible name, screen readers announce it with a generic name, making it unusable for users who rely on screen readers.</p>\n  </li>\n  <li>\n    <p>ARIA meter elements have accessible names: When a meter element doesn't have an accessible name, screen readers announce it with a generic name, making it unusable for users who rely on screen readers.</p>\n  </li>\n  <li>\n    <p>ARIA progressbar elements have accessible names: When a <code class=\"language-plaintext highlighter-rouge\">progressbar</code> element doesn't have an accessible name, screen readers announce it with a generic name, making it unusable for users who rely on screen readers.</p>\n  </li>\n  <li>\n    <p>Elements use only permitted ARIA attributes: Using ARIA attributes in roles where they are prohibited can mean that important information is not communicated to users of assistive technologies.</p>\n  </li>\n  <li>\n    <p>[role]s have all required [aria-*] attributes: Some ARIA roles have required attributes that describe the state of the element to screen readers.</p>\n  </li>\n  <li>\n    <p>Elements with an ARIA <code class=\"language-plaintext highlighter-rouge\">[role]</code> that require children to contain a specific <code class=\"language-plaintext highlighter-rouge\">[role]</code> have all required children: Some ARIA parent roles must contain specific child roles to perform their intended accessibility functions.</p>\n  </li>\n  <li>\n    <p>[role]s are contained by their required parent element: Some ARIA child roles must be contained by specific parent roles to properly perform their intended accessibility functions.</p>\n  </li>\n  <li>\n    <p>[role] values are valid: ARIA roles must have valid values in order to perform their intended accessibility functions.</p>\n  </li>\n  <li>\n    <p>Elements with the role=text attribute do not have focusable descendents: Adding <code class=\"language-plaintext highlighter-rouge\">role=text</code> around a text node split by markup enables VoiceOver to treat it as one phrase, but the element's focusable descendents will not be announced.</p>\n  </li>\n  <li>\n    <p>ARIA toggle fields have accessible names: When a toggle field doesn't have an accessible name, screen readers announce it with a generic name, making it unusable for users who rely on screen readers.</p>\n  </li>\n  <li>\n    <p>ARIA tooltip elements have accessible names: When a tooltip element doesn't have an accessible name, screen readers announce it with a generic name, making it unusable for users who rely on screen readers.</p>\n  </li>\n  <li>\n    <p>ARIA treeitem elements have accessible names: When a <code class=\"language-plaintext highlighter-rouge\">treeitem</code> element doesn't have an accessible name, screen readers announce it with a generic name, making it unusable for users who rely on screen readers.</p>\n  </li>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">[aria-*]</code> attributes have valid values: Assistive technologies, like screen readers, can't interpret ARIA attributes with invalid values.</p>\n  </li>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">[aria-*]</code> attributes are valid and not misspelled: Assistive technologies, like screen readers, can't interpret ARIA attributes with invalid names.</p>\n  </li>\n  <li>\n    <p>ARIA IDs are unique: The value of an ARIA ID must be unique to prevent other instances from being overlooked by assistive technologies.</p>\n  </li>\n</ol>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "a11y-audio-video",
        "displayName": "Audio and video",
        "tag": "a11y-audio-video",
        "description": "Alternative text, captions, and transcripts.",
        "why": "Supports accessibility by adding captions and transcripts, helping users with hearing impairments understand audio and video content.",
        "error": "No captions or transcripts provided.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "Web Content Accessibility Guidelines (WCAG)",
            "url": "/wcag"
          }
        ],
        "userStories": [
          {
            "title": "As a user with hearing or visual impairment, I want to have access to captions, transcripts, and audio descriptions for multimedia content so that I can fully understand and engage with the media on the website."
          }
        ],
        "sections": {
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/video-caption\">About video captions</a></li>\n</ul>"
          },
          "about": {
            "title": "About",
            "content": "<p>These are opportunities to provide alternative content for audio and video. This may improve the experience for users with hearing or vision impairments.</p><ol>\n  <li><code class=\"language-plaintext highlighter-rouge\">&lt;video&gt;</code> elements contain a <code class=\"language-plaintext highlighter-rouge\">&lt;track&gt;</code> element with <code class=\"language-plaintext highlighter-rouge\">[kind=\"captions\"]</code>: When a video provides a caption it is easier for deaf and hearing impaired users to access its information.</li>\n</ol>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "a11y-color-contrast",
        "displayName": "Color contrast",
        "tag": "a11y-color-contrast",
        "description": "Difference between text and background colors.",
        "why": "Improves readability by ensuring text stands out from the background, helping users with visual impairments see content clearly.",
        "error": "Insufficient color contrast detected.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "Web Content Accessibility Guidelines (WCAG)",
            "url": "/wcag"
          }
        ],
        "userStories": [
          {
            "title": "As a visually impaired user, I want sufficient color contrast between text and background so that I can read the content without strain or missing information."
          }
        ],
        "sections": {
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/color-contrast\">How to provide sufficient color contrast</a>.</li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/link-in-text-block\">How to make links distinguishable</a>.</li>\n</ul>"
          },
          "about": {
            "title": "About",
            "content": "<p>Content legibility can be improved by passing the following audits:</p><ol>\n  <li>\n    <p>Background and foreground colors have a sufficient contrast ratio: Low-contrast text is difficult or impossible for many users to read.</p>\n  </li>\n  <li>\n    <p>Links are distinguishable without relying on color: Low-contrast text is difficult or impossible for many users to read. Link text that is discernible improves the experience for users with low vision.</p>\n  </li>\n</ol>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "hidden",
        "displayName": "Hidden elements",
        "tag": "hidden",
        "description": "Ensure hidden elements are accessible.",
        "why": "Prevents search engines and users from accessing unnecessary content, improving page performance and ensuring only relevant information is displayed.",
        "error": "Hidden elements are inaccessible.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "Web Content Accessibility Guidelines (WCAG)",
            "url": "/wcag"
          }
        ],
        "userStories": [
          {
            "title": "As a user relying on assistive technologies, I want hidden elements to be properly marked so that I am not confused or misled by content that is not meant to be visible or interactive."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>Hidden elements are parts of a webpage that are not visible to users but still present in the code. They might be used for functions like pop-up menus or content that shows only when needed. However, hidden elements can be problematic for accessibility if not properly managed. Screen readers and other assistive tools may still detect them. Use proper techniques, such as <code class=\"language-plaintext highlighter-rouge\">aria-hidden=\"true\"</code> or hiding content visually while maintaining accessibility.</p><p>Follow these recommendations to avoid hiding content from visitors using assistive technology:</p><ol>\n  <li>\n    <p>All heading elements contain content: A heading with no content or inaccessible text prevent screen reader users from accessing information on the page's structure.</p>\n  </li>\n  <li>\n    <p>Identical links have the same purpose: Links with the same destination should have the same description, to help users understand the link's purpose and decide whether to follow it.</p>\n  </li>\n  <li>\n    <p>Document has a main landmark: One main landmark helps screen reader users navigate a web page.</p>\n  </li>\n  <li>\n    <p>Elements with visible text labels have matching accessible names: Visible text labels that do not match the accessible name can result in a confusing experience for screen reader users.</p>\n  </li>\n  <li>\n    <p>Tables use <code class=\"language-plaintext highlighter-rouge\">&lt;caption&gt;</code> instead of cells with the <code class=\"language-plaintext highlighter-rouge\">[colspan]</code> attribute to indicate a caption: Screen readers have features to make navigating tables easier. Ensuring that tables use the actual caption element instead of cells with the <code class=\"language-plaintext highlighter-rouge\">[colspan]</code> attribute may improve the experience for screen reader users.</p>\n  </li>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">&lt;td&gt;</code> elements in a large <code class=\"language-plaintext highlighter-rouge\">&lt;table&gt;</code> have one or more table headers: Screen readers have features to make navigating tables easier. Ensuring that <code class=\"language-plaintext highlighter-rouge\">&lt;td&gt;</code> elements in a large table (3 or more cells in width and height) have an associated table header may improve the experience for screen reader users.</p>\n  </li>\n</ol>"
          },
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/empty-heading\">About headings</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/identical-links-same-purpose\">About identical links</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/landmark-one-main\">About landmarks</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/label-content-name-mismatch\">About accessible names</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/table-fake-caption\">About captions</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/td-has-header\">About table headers</a></li>\n</ul>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "a11y-language",
        "displayName": "Language",
        "tag": "a11y-language",
        "description": "Use correct language attributes for accessibility.",
        "why": "Specifies the language of content, helping screen readers and browsers display text correctly for users in different languages.",
        "error": "Language attribute is missing or incorrect.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "Web Content Accessibility Guidelines (WCAG)",
            "url": "/wcag"
          }
        ],
        "userStories": [
          {
            "title": "As a multilingual user or screen reader user, I want the correct language to be defined on the website so that the content is read and interpreted accurately by assistive technologies."
          }
        ],
        "sections": {
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/valid-lang\">How to use the <code class=\"language-plaintext highlighter-rouge\">lang</code> attribute</a>\n <a href=\"https://dequeuniversity.com/rules/axe/4.10/html-xml-lang-mismatch\">Learn more about the <code class=\"language-plaintext highlighter-rouge\">lang</code> attribute</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/html-lang-valid\">How to use the <code class=\"language-plaintext highlighter-rouge\">lang</code> attribute</a>\n <a href=\"https://dequeuniversity.com/rules/axe/4.10/html-has-lang\">Learn more about the <code class=\"language-plaintext highlighter-rouge\">lang</code> attribute</a></li>\n</ul>"
          },
          "about": {
            "title": "About",
            "content": "<p>Follow these recommendations to improve the experience for visitors who may take advantage of translations.</p><ol>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">&lt;html&gt;</code> element has a <code class=\"language-plaintext highlighter-rouge\">[lang]</code> attribute: If a page doesn't specify a <code class=\"language-plaintext highlighter-rouge\">lang</code> attribute, a screen reader assumes that the page is in the default language that the user chose when setting up the screen reader. If the page isn't actually in the default language, then the screen reader might not announce the page's text correctly.</p>\n  </li>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">&lt;html&gt;</code> element has a valid value for its <code class=\"language-plaintext highlighter-rouge\">[lang]</code> attribute: Specifying a valid <a href=\"https://www.w3.org/International/questions/qa-choosing-language-tags#question\">BCP 47 language</a> helps screen readers announce text properly.</p>\n  </li>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">&lt;html&gt;</code> element has an <code class=\"language-plaintext highlighter-rouge\">[xml:lang]</code> attribute with the same base language as the <code class=\"language-plaintext highlighter-rouge\">[lang]</code> attribute: If the webpage does not specify a consistent language, then the screen reader might not announce the page's text correctly.</p>\n  </li>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">[lang]</code> attributes have a valid value: Specifying a valid <a href=\"https://www.w3.org/International/questions/qa-choosing-language-tags#question\">BCP 47 language</a> on elements helps ensure that text is pronounced correctly by a screen reader.</p>\n  </li>\n</ol>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "a11y-names-labels",
        "displayName": "Names and labels",
        "tag": "a11y-names-labels",
        "description": "Descriptive identifiers for elements.",
        "why": "Clarifies content by providing clear names and labels, helping users understand and navigate forms or buttons easily.",
        "error": "Elements lack descriptive labels.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "Web Content Accessibility Guidelines (WCAG)",
            "url": "/wcag"
          }
        ],
        "userStories": [
          {
            "title": "As a screen reader user, I want every interactive element to have a clear and descriptive name or label so that I can understand its purpose and use it correctly."
          }
        ],
        "sections": {
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/skip-link\">About skip links</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/select-name\">About the <code class=\"language-plaintext highlighter-rouge\">select</code> element</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/object-alt\">About alt text for <code class=\"language-plaintext highlighter-rouge\">object</code> elements</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/link-name\">How to make links accessible</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/label\">About form element labels</a>\n <a href=\"https://dequeuniversity.com/rules/axe/4.10/input-image-alt\">Learn about input image alt text</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/input-button-name\">About input buttons</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/image-redundant-alt\">About the <code class=\"language-plaintext highlighter-rouge\">alt</code> attribute</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/button-name\">How to make buttons more accessible</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/document-title\">About document titles</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/form-field-multiple-labels\">How to use form labels</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/frame-title\">About frame titles</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/image-alt\">About the <code class=\"language-plaintext highlighter-rouge\">alt</code> attribute</a></li>\n</ul>"
          },
          "about": {
            "title": "About",
            "content": "<p>Enhance your application's usability for visitors using screen readers by following these recommendations:</p><ol>\n  <li>\n    <p>Buttons have an accessible name: When a button doesn't have an accessible name, screen readers announce it as “button”, making it unusable for users who rely on screen readers.</p>\n  </li>\n  <li>\n    <p>Document has a <code class=\"language-plaintext highlighter-rouge\">&lt;title&gt;</code> element: The title gives screen reader users an overview of the page, and search engine users rely on it heavily to determine if a page is relevant to their search.</p>\n  </li>\n  <li>\n    <p>No form fields have multiple labels: Form fields with multiple labels can be confusingly announced by assistive technologies like screen readers which use either the first, the last, or all of the labels.</p>\n  </li>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">&lt;frame&gt;</code> or <code class=\"language-plaintext highlighter-rouge\">&lt;iframe&gt;</code> elements have a title: Screen reader users rely on frame titles to describe the contents of frames.</p>\n  </li>\n  <li>\n    <p>Image elements have <code class=\"language-plaintext highlighter-rouge\">[alt]</code> attributes: Informative elements should aim for short, descriptive alternate text. Decorative elements can be ignored with an empty alt attribute.</p>\n  </li>\n  <li>\n    <p>Image elements do not have <code class=\"language-plaintext highlighter-rouge\">[alt]</code> attributes that are redundant text: Informative elements should aim for short, descriptive alternative text. Alternative text that is exactly the same as the text adjacent to the link or image is potentially confusing for screen reader users, because the text will be read twice.</p>\n  </li>\n  <li>\n    <p>Input buttons have discernible text: Adding discernable and accessible text to input buttons may help screen reader users understand the purpose of the input button.</p>\n  </li>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">&lt;input type=\"image\"&gt;</code> elements have <code class=\"language-plaintext highlighter-rouge\">[alt]</code> text: When an image is being used as an <code class=\"language-plaintext highlighter-rouge\">&lt;input&gt;</code> button, providing alternative text can help screen reader users understand the purpose of the button.</p>\n  </li>\n  <li>\n    <p>Form elements have associated labels: Labels ensure that form controls are announced properly by assistive technologies, like screen readers.</p>\n  </li>\n  <li>\n    <p>Links have a discernible name: Link text (and alternate text for images, when used as links) that is discernible, unique, and focusable improves the navigation experience for screen reader users.</p>\n  </li>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">&lt;object&gt;</code> elements have alternate text: Screen readers cannot translate non-text content. Adding alternate text to <code class=\"language-plaintext highlighter-rouge\">&lt;object&gt;</code> elements helps screen readers convey meaning to users.</p>\n  </li>\n  <li>\n    <p>Select elements have associated label elements: Form elements without effective labels can create frustrating experiences for screen reader users.</p>\n  </li>\n  <li>\n    <p>Skip links are focusable: Including a skip link can help users skip to the main content to save time.</p>\n  </li>\n</ol>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "a11y-navigation",
        "displayName": "Navigation",
        "tag": "a11y-navigation",
        "description": "Application keyboard navigation.",
        "why": "Enables users with motor disabilities to navigate apps efficiently using only the keyboard, improving accessibility and speed.",
        "error": "Keyboard navigation is not functional.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "Web Content Accessibility Guidelines (WCAG)",
            "url": "/wcag"
          }
        ],
        "userStories": [
          {
            "title": "As a screen reader user, I want buttons and form fields to have clear, descriptive names and labels so that I can understand their purpose and interact with them confidently."
          }
        ],
        "sections": {
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/accesskeys\">About access keys</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/bypass\">About bypass blocks</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/heading-order\">About heading order</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/tabindex\">About the <code class=\"language-plaintext highlighter-rouge\">tabindex</code> attribute</a></li>\n</ul>"
          },
          "about": {
            "title": "About",
            "content": "<p>Improve accessibility by following these recommendations:</p><ol>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">[accesskey]</code> values are unique: Access keys let users quickly focus a part of the page. For proper navigation, each access key must be unique.</p>\n  </li>\n  <li>\n    <p>The page contains a heading, skip link, or landmark region: Adding ways to bypass repetitive content lets keyboard users navigate the page more efficiently.</p>\n  </li>\n  <li>\n    <p>Heading elements appear in a sequentially-descending order: Properly ordered headings that do not skip levels convey the semantic structure of the page, making it easier to navigate and understand when using assistive technologies.</p>\n  </li>\n  <li>\n    <p>No element has a <code class=\"language-plaintext highlighter-rouge\">[tabindex]</code> value greater than 0: A value greater than 0 implies an explicit navigation ordering. Although technically valid, this often creates frustrating experiences for users who rely on assistive technologies.</p>\n  </li>\n</ol>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "a11y-tables-lists",
        "displayName": "Tables and lists",
        "tag": "a11y-tables-lists",
        "description": "Ensure tables and lists are accessible.",
        "why": "Improves access by making tables and lists easier to navigate for users with disabilities.",
        "error": "Tables or lists are not accessible.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "Web Content Accessibility Guidelines (WCAG)",
            "url": "/wcag"
          }
        ],
        "userStories": [
          {
            "title": "As a screen reader user, I want data tables to have clear headers and associations so that I can understand the relationships between rows and columns."
          }
        ],
        "sections": {
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/definition-list\">How to structure definition lists correctly</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/dlitem\">How to structure definition lists correctly</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/list\">About proper list structure</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/listitem\">About proper list structure</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/table-duplicate-name\">About summary and caption</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/td-headers-attr\">About the <code class=\"language-plaintext highlighter-rouge\">headers</code> attribute</a></li>\n  <li><a href=\"https://dequeuniversity.com/rules/axe/4.10/th-has-data-cells\">About table headers</a></li>\n</ul>"
          },
          "about": {
            "title": "About",
            "content": "<p>Follow these recommendations to improve the accessibility of tabular and list data:</p><ol>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">&lt;dl&gt;</code>'s contain only properly-ordered <code class=\"language-plaintext highlighter-rouge\">&lt;dt&gt;</code> and <code class=\"language-plaintext highlighter-rouge\">&lt;dd&gt;</code> groups, <code class=\"language-plaintext highlighter-rouge\">&lt;script&gt;</code>, <template> or `&lt;div&gt;` elements: When definition lists are not properly marked up, screen readers may produce confusing or inaccurate output.</template></p>\n  </li>\n  <li>\n    <p>Definition list items are wrapped in <code class=\"language-plaintext highlighter-rouge\">&lt;dl&gt;</code> elements: Definition list items (<code class=\"language-plaintext highlighter-rouge\">&lt;dt&gt;</code> and <code class=\"language-plaintext highlighter-rouge\">&lt;dd&gt;</code>) must be wrapped in a parent <code class=\"language-plaintext highlighter-rouge\">&lt;dl&gt;</code> element to ensure that screen readers can properly announce them.</p>\n  </li>\n  <li>\n    <p>Lists contain only <code class=\"language-plaintext highlighter-rouge\">&lt;li&gt;</code> elements and script supporting elements (<code class=\"language-plaintext highlighter-rouge\">&lt;script&gt;</code> and <code class=\"language-plaintext highlighter-rouge\">&lt;template&gt;</code>): Screen readers have a specific way of announcing lists. Ensuring proper list structure aids screen reader output.</p>\n  </li>\n  <li>\n    <p>List items (<code class=\"language-plaintext highlighter-rouge\">&lt;li&gt;</code>) are contained within <code class=\"language-plaintext highlighter-rouge\">&lt;ul&gt;</code>, <code class=\"language-plaintext highlighter-rouge\">&lt;ol&gt;</code> or <code class=\"language-plaintext highlighter-rouge\">&lt;menu&gt;</code> parent elements: Screen readers require list items (<code class=\"language-plaintext highlighter-rouge\">&lt;li&gt;</code>) to be contained within a parent <code class=\"language-plaintext highlighter-rouge\">&lt;ul&gt;</code>, <code class=\"language-plaintext highlighter-rouge\">&lt;ol&gt;</code> or <code class=\"language-plaintext highlighter-rouge\">&lt;menu&gt;</code> to be announced properly.</p>\n  </li>\n  <li>\n    <p>Tables have different content in the summary attribute and <code class=\"language-plaintext highlighter-rouge\">&lt;caption&gt;</code>: The summary attribute should describe the table structure, while <code class=\"language-plaintext highlighter-rouge\">&lt;caption&gt;</code> should have the onscreen title. Accurate table mark-up helps users of screen readers.</p>\n  </li>\n  <li>\n    <p>Cells in a <code class=\"language-plaintext highlighter-rouge\">&lt;table&gt;</code> element that use the <code class=\"language-plaintext highlighter-rouge\">[headers]</code> attribute refer to table cells within the same table: Screen readers have features to make navigating tables easier. Ensuring <code class=\"language-plaintext highlighter-rouge\">&lt;td&gt;</code> cells using the <code class=\"language-plaintext highlighter-rouge\">[headers]</code> attribute only refer to other cells in the same table may improve the experience for screen reader users.</p>\n  </li>\n  <li>\n    <p><code class=\"language-plaintext highlighter-rouge\">&lt;th&gt;</code> elements and elements with <code class=\"language-plaintext highlighter-rouge\">[role=\"columnheader\"/\"rowheader\"]</code> have data cells they describe: Screen readers have features to make navigating tables easier. Ensuring table headers always refer to some set of cells may improve the experience for screen reader users.</p>\n  </li>\n</ol>"
          }
        },
        "relatedLinks": {}
      }
    ]
  },
  "content": {
    "displayName": "Content",
    "icon": "rectangle-list",
    "color": "#d5bfff",
    "url": "/guidance/content",
    "description": "ScanGov content standards and guidance.",
    "attributes": [
      {
        "key": "title",
        "displayName": "Page title",
        "tag": "<title>",
        "description": "Describes webpage content in a few words.",
        "why": "Identifies the page's content, helping users and search engines understand it quickly.",
        "error": "Page title is missing or unclear.",
        "impact": 10,
        "guidance": [
          {
            "displayName": "21st Century Integrated Digital Experience Act",
            "url": "/21stcenturyidea"
          },
          {
            "displayName": "Federal website standards",
            "url": "/federal-website-standards"
          },
          {
            "displayName": "Memorandum (M-23-22)",
            "url": "/memorandum-m-23-22"
          }
        ],
        "userStories": [
          {
            "title": "As a screen reader user or someone navigating multiple tabs, I want each page to have a clear and unique title so that I can quickly understand the content and context of the page."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>The HTML <code class=\"language-plaintext highlighter-rouge\">&lt;title&gt;</code> tag sets the title of a webpage, which appears in the browser tab and search results. It helps users know what the page is about and improves search engine optimization. The <code class=\"language-plaintext highlighter-rouge\">&lt;title&gt;</code> tag goes inside the <code class=\"language-plaintext highlighter-rouge\">&lt;head&gt;</code> section of an HTML document. A good title is short, clear, and relevant to the page content.</p>"
          },
          "code": {
            "title": "Code",
            "content": "<div class=\"language-html highlighter-rouge\"><div class=\"highlight\"><pre class=\"highlight\"><code><span class=\"nt\">&lt;head&gt;</span>\n  <span class=\"nt\">&lt;title&gt;</span>Our website<span class=\"nt\">&lt;/title&gt;</span>\n<span class=\"nt\">&lt;/head&gt;</span>\n</code></pre></div></div>"
          },
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://developer.mozilla.org/en-US/docs/Web/HTML/Element/title\">The Document Title element</a> (Mozilla)</li>\n</ul>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "description",
        "displayName": "Page description",
        "tag": "<meta name=\"description\">",
        "description": "Describes webpage content in a few words.",
        "why": "Describes page content briefly, helping users understand what to expect and improving search engine results.",
        "error": "Page description is missing or unclear.",
        "impact": 8,
        "guidance": [
          {
            "displayName": "21st Century Integrated Digital Experience Act",
            "url": "/21stcenturyidea"
          },
          {
            "displayName": "Federal website standards",
            "url": "/federal-website-standards"
          },
          {
            "displayName": "Memorandum (M-23-22)",
            "url": "/memorandum-m-23-22"
          }
        ],
        "userStories": [
          {
            "title": "As a user browsing search results or sharing links, I want each page to have a clear and relevant description so that I can understand what the page is about before visiting it."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>A page description is a short summary of a webpage, usually shown in search results. It's set using the <code class=\"language-plaintext highlighter-rouge\">&lt;meta name=\"description\"&gt;</code> tag inside the <code class=\"language-plaintext highlighter-rouge\">&lt;head&gt;</code> section of an HTML document. A good description is clear, brief, and tells users what to expect on the page. It also helps with search engine optimization.</p>"
          },
          "code": {
            "title": "Code",
            "content": "<div class=\"language-html highlighter-rouge\"><div class=\"highlight\"><pre class=\"highlight\"><code><span class=\"nt\">&lt;head&gt;</span>\n  <span class=\"nt\">&lt;meta</span> <span class=\"na\">name=</span><span class=\"s\">\"description\"</span> <span class=\"na\">content=</span><span class=\"s\">\"Welcome to our website\"</span><span class=\"nt\">&gt;</span>\n<span class=\"nt\">&lt;/head&gt;</span>\n</code></pre></div></div>"
          },
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Webpage-metadata\">What's in the head? Webpage metadata</a> (Mozilla)</li>\n</ul>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "viewport",
        "displayName": "Viewport meta tag",
        "featured": true,
        "tag": "<meta name=\"viewport\">",
        "description": "Makes websites fit all screen sizes.",
        "why": "Optimizes page display for various devices, ensuring content looks good on all screen sizes and enhances user experience.",
        "error": "Viewport meta tag is missing.",
        "impact": 10,
        "guidance": [
          {
            "displayName": "21st Century Integrated Digital Experience Act",
            "url": "/21stcenturyidea"
          },
          {
            "displayName": "Memorandum (M-23-22)",
            "url": "/memorandum-m-23-22"
          }
        ],
        "userStories": [
          {
            "title": "As a mobile user, I want the website to scale and display correctly on my device so that I can read and interact with the content without zooming or horizontal scrolling."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>The viewport meta tag helps web pages look good on all devices by controlling the screen size and zoom settings. This makes websites adjust to fit different screens. You can also disable zooming or set a custom zoom level. It's important for making websites mobile-friendly.</p>"
          },
          "example": {
            "title": "Example",
            "content": "<div class=\"language-html highlighter-rouge\"><div class=\"highlight\"><pre class=\"highlight\"><code><span class=\"nt\">&lt;meta</span> <span class=\"na\">name=</span><span class=\"s\">\"viewport\"</span> <span class=\"na\">content=</span><span class=\"s\">\"width=device-width, initial-scale=1.0\"</span><span class=\"nt\">&gt;</span>\n</code></pre></div></div>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "image_aspect_ratio",
        "displayName": "Image aspect ratio",
        "featured": true,
        "tag": "image-aspect-ratio",
        "description": "Ratio of image width to height.",
        "why": "Ensures images display correctly without distortion on different screens and devices.",
        "error": "Image could not be displayed correctly due to aspect ratio issues.",
        "impact": 1,
        "guidance": [
          {
            "displayName": "Web Content Accessibility Guidelines (WCAG)",
            "url": "/wcag"
          }
        ],
        "userStories": [
          {
            "title": "As a user, I want the website to display images at the correct aspect ratio so that I can read and interact with the content without distortion."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>Image aspect ratio is the relationship between an image's width and height. It's expressed as two numbers, like 16:9 or 4:3. For example, a 16:9 aspect ratio means the width is 16 units wide for every 9 units of height. Aspect ratio helps ensure images look good on different screens, like phones, computers, and TVs. Using the correct ratio prevents stretching or squishing the image and maintains its quality.</p>"
          },
          "links": {
            "title": "Links",
            "content": "<ul><li><a href=\"https://developer.chrome.com/docs/lighthouse/best-practices/image-aspect-ratio/\">Displays images with incorrect aspect ratio</a></li><li><a href=\"https://developer.mozilla.org/en-US/docs/Web/CSS/aspect-ratio\">aspect-ratio</a></li></ul>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "html_lang_valid",
        "displayName": "Valid language code",
        "tag": "html-lang-valid",
        "description": "Correct code to identify language.",
        "why": "Ensures websites display text in the correct language, making content easier to understand for users.",
        "error": "Page language is not defined in the HTML.",
        "impact": 1,
        "guidance": [
          {
            "displayName": "Web Content Accessibility Guidelines (WCAG)",
            "url": "/wcag"
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>A valid language code is a short code used to represent a language, such as \"en\" for English or \"fr\" for French. It's important for websites and apps to use the correct code to display text in the right language for users. These codes also help websites adjust to different regions, ensuring users see content in their preferred language.</p>"
          },
          "code": {
            "title": "Code",
            "content": "<code>&lt;html lang=\"en\"&gt;</code>"
          },
          "userStories": {
            "title": "As a website user, I want the content to appear in my preferred language, so I can easily understand it."
          },
          "links": {
            "title": "Links",
            "content": "<ul><li><a href=\"https://www.w3.org/International/articles/language-tags/\">Language tags in HTML and XML</a></li></ul>"
          }
        }
      },
      {
        "key": "zooming-scaling",
        "displayName": "Zooming/scaling enabled",
        "featured": true,
        "tag": "zooming-scaling",
        "description": "Making images bigger or smaller.",
        "why": "Allows users to adjust size for better readability, improving accessibility and making content easier to view on all devices.",
        "error": "Viewport configuration error: 'user-scalable' is set to 'no' or 'maximum-scale' exceeds the recommended limit.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "Web Content Accessibility Guidelines (WCAG)",
            "url": "/wcag"
          }
        ],
        "userStories": [
          {
            "title": "As a website user, I want to zoom and scale content so I can read and view it comfortably on any device."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>Zooming and scaling mean changing the size of something on a screen, like making an image or text bigger or smaller. Zooming usually refers to the whole screen or view, while scaling changes the size of a specific object, like a picture. These tools help people see things better, fit images in different spaces, or make websites work well on all screen sizes. It's useful for both design and accessibility.</p>"
          },
          "code": {
            "title": "Code",
            "content": "<code>&lt;meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=5\"&gt;</code>"
          },
          "links": {
            "title": "Links",
            "content": "<ul><li><a href=\"https://dequeuniversity.com/rules/axe/4.10/meta-viewport\">Zooming and scaling must not be disabled</a></li><li><a href=\"https://developer.mozilla.org/en-US/docs/Web/HTML/Guides/Viewport_meta_element\">Using the viewport meta element</a></li></ul>"
          }
        }
      },
      {
        "key": "doctype",
        "displayName": "Valid doctype",
        "tag": "doctype",
        "description": "Tells browser how to read code.",
        "why": "Helps browsers display web pages correctly by telling them what kind of HTML code the page is using.",
        "error": "Page may not display correctly due to missing or incorrect doctype declaration.",
        "impact": 1,
        "guidance": [
          {
            "displayName": "Web Content Accessibility Guidelines (WCAG)",
            "url": "/wcag"
          }
        ],
        "userStories": [
          {
            "title": "As a web developer, I want to define the correct doctype so that my website displays properly in all browsers."
          },
          {
            "title": "As a website visitor, I want pages to load and look right, so I can read and use them easily."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>Doctype (short for \"document type declaration\") tells the web browser what version of HTML the page is using. It helps the browser understand how to read and display the webpage correctly. Without it, the browser might not show the page the way it should. The most common doctype today is for HTML5, written as <code>&lt;!DOCTYPE html&gt;</code>. It's simple but important for making websites work the right way across different browsers.</p>"
          },
          "code": {
            "title": "Code",
            "content": "<div class=\"language-html highlighter-rouge\"><div class=\"highlight\"><pre class=\"highlight\"><code><span class=\"cp\">&lt;!doctype html&gt;</span>\n</code></pre></div></div>"
          },
          "links": {
            "title": "Links",
            "content": "<ul><li><a href=\"https://developer.mozilla.org/en-US/docs/Web/API/Document/doctype\">Learn more about the doctype declaration</a> (MDN)</li><li><a href=\"https://html.spec.whatwg.org/multipage/syntax.html#the-doctype\">The DOCTYPE</a></li></ul>"
          }
        }
      },
      {
        "key": "charset",
        "displayName": "Character encoding",
        "tag": "charset",
        "description": "Character set for text encoding.",
        "why": "Helps computers show words and symbols correctly in different languages and on different devices.",
        "error": "Charset declaration is missing or occurs too late in the HTML.",
        "impact": 1,
        "guidance": [
          {
            "displayName": "Web Content Accessibility Guidelines (WCAG)",
            "url": "/wcag"
          }
        ],
        "userStories": [
          {
            "title": "As a website visitor, I want the text to display correctly in my language so I can read and understand it easily."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>A charset (character set) is a list of letters, numbers, and symbols that computers use to show and read text. It helps make sure the right characters appear, especially in different languages. For example, UTF-8 is a popular charset that works with many languages and symbols. Without the correct charset, websites may show weird symbols or question marks. Setting the right charset helps everyone read and understand the text properly.</p>"
          },
          "links": {
            "title": "Links",
            "content": "<ul><li><a href=\"https://www.w3.org/International/articles/definitions-characters/\">Character encodings: Essential concepts</a></li></ul>"
          }
        },
        "relatedLinks": {}
      }
    ]
  },
  "domain": {
    "displayName": "Domain",
    "icon": "link",
    "color": "#7efbe1",
    "url": "/guidance/domain",
    "description": "ScanGov domain standards and guidance.",
    "attributes": [
      {
        "key": "https",
        "displayName": "Hypertext Transfer Protocol Secure (HTTPS)",
        "featured": true,
        "tag": "HTTPS",
        "description": "Privacy and integrity protection.",
        "why": "Secures data by encrypting communication, protecting user privacy and preventing unauthorized access to sensitive information during online interactions.",
        "error": "Site is not served over HTTPS.",
        "impact": 10,
        "guidance": [
          {
            "displayName": "Federal website standards",
            "url": "/federal-website-standards"
          },
          {
            "displayName": "Memorandum (M-23-22)",
            "url": "/memorandum-m-23-22"
          }
        ],
        "userStories": [
          {
            "title": "As a site visitor, I want the website to use HTTPS so that my data is encrypted and protected from interception or tampering while browsing or submitting information."
          }
        ],
        "sections": {
          "guidance": {
            "title": "Guidance",
            "content": "<p>All government websites must have HTTPS.</p><p>OMB Memorandum M-15-1338 requires agencies to encrypt HTTP traffic that travels\nover the public internet to or from a Federal system, using HTTPS and HTTP Strict Transport\nSecurity (HSTS)</p>"
          },
          "about": {
            "title": "About",
            "content": "<p>Hypertext Transfer Protocol Secure (HTTPS) is the strongest privacy and integrity protection currently available for public web connections. HTTPS ensures users that their privacy is protected when visiting a government website.</p><p>HTTPS is indicated by a lock icon and/or <code class=\"language-plaintext highlighter-rouge\">https://</code> in the browser bar.</p>"
          },
          "example": {
            "title": "Examples",
            "content": "<p>Example government websites with HTTPS:</p><ul>\n  <li><a href=\"https://digital.gov\">https://digital.gov</a></li>\n  <li><a href=\"https://whitehouse.gov\">https://whitehouse.gov</a></li>\n</ul>"
          },
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://https.cio.gov/\">The HTTPS-Only Standard</a> (CIO.gov)</li>\n  <li><a href=\"https://www.whitehouse.gov/wp-content/uploads/legacy_drupal_files/omb/memoranda/2015/m-15-13.pdf\">M-15-13: Policy to Require Secure Connections across Federal Websites and Web\nServices</a></li>\n</ul>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "www",
        "displayName": "www resolution",
        "tag": "www",
        "description": "One domain works with www and non-www.",
        "why": "Ensures consistent site display whether users type with or without 'www,' preventing errors and improving overall accessibility.",
        "error": "www and non-www versions are inconsistent.",
        "impact": 5,
        "guidance": [
          {
            "displayName": "Federal website standards",
            "url": "/federal-website-standards"
          },
          {
            "displayName": "Google Search Central",
            "url": "/google-search-central"
          }
        ],
        "userStories": [
          {
            "title": "As a site visitor, I want to access the website using either www or non-www URLs and be automatically redirected to the correct version so that I don't encounter errors or duplicate content."
          }
        ],
        "sections": {
          "guidance": {
            "title": "Guidance",
            "content": "<p>All government websites must have <code class=\"language-plaintext highlighter-rouge\">www</code> and non-<code class=\"language-plaintext highlighter-rouge\">www</code> resolution.</p>"
          },
          "about": {
            "title": "About",
            "content": "<p>Domain canonicalization allows access to the intended website address, whether users type <code class=\"language-plaintext highlighter-rouge\">www</code> (<code class=\"language-plaintext highlighter-rouge\">www.example.gov</code>) or not (<code class=\"language-plaintext highlighter-rouge\">example.gov</code>). Improper canonicalization will fail to direct <code class=\"language-plaintext highlighter-rouge\">example.gov</code> to the intended address, and users will receive an error.</p>"
          },
          "example": {
            "title": "Examples",
            "content": "<p>Example of a government website with <code class=\"language-plaintext highlighter-rouge\">www</code> and non-<code class=\"language-plaintext highlighter-rouge\">www</code> resolution:</p><ul>\n  <li><a href=\"https://digital.gov\">https://digital.gov</a></li>\n  <li><a href=\"https://www.digital.gov\">https://www.digital.gov</a></li>\n</ul>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "dotgov",
        "displayName": "Sponsored top-level domain (sTLD)",
        "featured": true,
        "tag": "sTLD",
        "description": "Sponsored top-level domain (.gov / .edu / .mil).",
        "why": "Defines trusted website categories, helping users identify official sites and improving credibility and security for specific organizations.",
        "error": "Domain is not an official sTLD.",
        "impact": 7,
        "guidance": [
          {
            "displayName": "Federal website standards",
            "url": "/federal-website-standards"
          }
        ],
        "userStories": [
          {
            "title": "As a site visitor, I want to access government websites with a `.gov` domain so that I can be confident the site is official, secure, and trustworthy, providing accurate and authoritative government information."
          }
        ],
        "sections": {
          "guidance": {
            "title": "Guidance",
            "content": "<p>All government websites must have a <code class=\"language-plaintext highlighter-rouge\">.gov</code> / <code class=\"language-plaintext highlighter-rouge\">.edu</code> / <code class=\"language-plaintext highlighter-rouge\">.mil</code> sponsored top-level domain.</p>"
          },
          "about": {
            "title": "About",
            "content": "<p>Generic top-level domains (gTLD) (<code class=\"language-plaintext highlighter-rouge\">.com</code>, <code class=\"language-plaintext highlighter-rouge\">.org</code>, etc.) are non-country extensions that indicate the purpose or source of the website.</p><p>sTLDs (<code class=\"language-plaintext highlighter-rouge\">.gov</code> / <code class=\"language-plaintext highlighter-rouge\">.edu</code> / <code class=\"language-plaintext highlighter-rouge\">.mil</code>) are a subgroup of gTLDs managed by designated organizations and restricted to specific registrant types.</p><p>A <code class=\"language-plaintext highlighter-rouge\">.gov</code> / <code class=\"language-plaintext highlighter-rouge\">.edu</code> / <code class=\"language-plaintext highlighter-rouge\">.mil</code> extension verifies that the website is managed by a United States government organization (federal, state, local). Government non-.gov gTLDs can potentially confuse users and create opportunities for non-government entities to spoof official government services. Adopting the <code class=\"language-plaintext highlighter-rouge\">.gov</code> / <code class=\"language-plaintext highlighter-rouge\">.edu</code> / <code class=\"language-plaintext highlighter-rouge\">.mil</code> extension ensures users are visiting an official government website.</p>"
          },
          "example": {
            "title": "Examples",
            "content": "<p>Example of government websites with a <code class=\"language-plaintext highlighter-rouge\">.gov</code> sTLD:</p><ul>\n  <li><a href=\"https://digital.gov\">digital.gov</a></li>\n  <li><a href=\"https://whitehouse.gov\">whitehouse.gov</a></li>\n</ul>"
          },
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://en.wikipedia.org/wiki/.gov\">.gov</a> (Wikipedia)</li>\n  <li><a href=\"https://get.gov/\">Get a .gov</a> (Cybersecurity and Infrastructure Security Agency)</li>\n  <li><a href=\"https://en.wikipedia.org/wiki/Sponsored_top-level_domain\">Sponsored top-level domain</a> (Wikipedia)</li>\n</ul>"
          }
        },
        "relatedLinks": {
          "audio": "https://standards.scangov.org/assets/audio/stld.mp3"
        }
      }
    ]
  },
  "performance": {
    "displayName": "Performance",
    "icon": "gauge-high",
    "color": "#ffbc78",
    "url": "/guidance/performance",
    "description": "ScanGov performance standards and guidance.",
    "attributes": [
      {
        "key": "cls",
        "displayName": "Cumulative Layout Shift (CLS)",
        "featured": true,
        "tag": "CLS",
        "description": "Measures unexpected webpage content shifts.",
        "why": "Minimizes unexpected page movements, improving user experience by keeping content stable while it loads.",
        "error": "Unexpected layout shifts detected.",
        "impact": 5,
        "guidance": [
          {
            "displayName": "Web Vitals / Core Web Vitals",
            "url": "/web-vitals-core-web-vitals"
          }
        ],
        "userStories": [
          {
            "title": "As a user reading the page, I want the content to stay stable while loading so that I don't accidentally click the wrong thing or lose my place."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>​Cumulative Layout Shift (CLS) measures how much a webpage's content unexpectedly moves during loading, affecting user experience. A good CLS score is 0.1 or less. Common causes include images or ads without specified dimensions, dynamically added content, and late-loading fonts. To improve CLS, always set size attributes for media, reserve space for ads, and ensure fonts load properly. ​</p>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "fcp",
        "displayName": "First Contentful Paint (FCP)",
        "featured": true,
        "tag": "FCP",
        "description": "The page begins to display within 1.8 seconds.",
        "why": "Measures how quickly important content appears, improving user experience by reducing wait time when loading a page.",
        "error": "Page didn't display within 1.8 seconds.",
        "impact": 8,
        "guidance": [
          {
            "displayName": "Web Vitals / Core Web Vitals",
            "url": "/web-vitals-core-web-vitals"
          }
        ],
        "userStories": [
          {
            "title": "As a user visiting the website, I want the first visible content to load quickly so that I know the site is responding and I don't leave out of frustration."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>First Contentful Paint (FCP) measures how quickly a webpage shows any content after a user starts to load it. It checks the time from when the user begins to navigate to the page until any part of the page's content, like text or images, appears on the screen. A fast FCP reassures users that the page is loading. For a good user experience, aim for an FCP of 1.8 seconds or less.</p>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "inp",
        "displayName": "Interaction to Next Paint (INP)",
        "tag": "INP",
        "description": "Page responds in under 0.2 seconds.",
        "why": "A fast response time increases interactivity and user satisfaction, leading to a more engaging experience.",
        "error": "Page response exceeded 0.2 seconds.",
        "impact": 9,
        "guidance": [
          {
            "displayName": "Web Vitals / Core Web Vitals",
            "url": "/web-vitals-core-web-vitals"
          }
        ],
        "userStories": [
          {
            "title": "As a user interacting with the page, I want the site to respond quickly to my actions so that I feel in control and don't experience delays."
          },
          {
            "title": "As a user of a cheaper model mobile phone, I want your website to respond to my interactions quickly. If it is inefficient and performs a lot of processing on my device I wonder if it is even working, get stressed out and may click multiple times."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>Interaction to Next Paint (INP) measures how quickly a webpage responds to user actions like clicks or typing. It tracks the time from when you interact until the next screen update. A good INP score is 200 milliseconds or less, ensuring a smooth experience. INP has replaced First Input Delay (FID) as a key performance metric.</p>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "lcp",
        "displayName": "Largest Contentful Paint (LCP)",
        "tag": "LCP",
        "description": "Major content loads in 2.5 seconds.",
        "why": "Measures when the main content fully loads, improving user experience by showing the most important part of a page quickly.",
        "error": "Main content didn't load in 2.5 seconds.",
        "impact": 8,
        "sections": {
          "about": {
            "title": "About",
            "content": "Largest Contentful Paint (LCP) measures how long it takes for the main content of a web page to appear. This is important because it helps users know when the page is ready. A good LCP time is 2.5 seconds or less. It tracks the largest visible element, like images, videos, or text blocks. A faster LCP improves user experience and helps websites perform better."
          }
        },
        "guidance": [
          {
            "displayName": "Web Vitals / Core Web Vitals",
            "url": "/web-vitals-core-web-vitals"
          }
        ],
        "userStories": [
          {
            "title": "As a user visiting the site, I want the main content to load quickly so that I can start engaging with the page without waiting."
          },
          {
            "title": "As a commuter on the BART train riding through Lafayette, I want your website to display the main content efficiently so my temporarily constrained bandwidth which radically exacerbates loading times doesn't make me give up before it loads."
          }
        ]
      },
      {
        "key": "ttfb",
        "displayName": "Time to First Byte (TTFB)",
        "tag": "TTFB",
        "description": "Code received in 0.8 seconds.",
        "why": "Measures how quickly a server responds, impacting page load speed and user experience by reducing wait times.",
        "error": "Server response took over 0.8 seconds.",
        "impact": 8,
        "guidance": [
          {
            "displayName": "Web Vitals / Core Web Vitals",
            "url": "/web-vitals-core-web-vitals"
          }
        ],
        "userStories": [
          {
            "title": "As a user requesting a web page, I want the server to respond quickly so that the page starts loading without noticeable delay."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>Time to First Byte (TTFB) measures the time it takes from when a browser requests a resource to when the first byte of data begins to load. It's an important metric for website performance, affecting how quickly a page appears. A good TTFB is under 0.8 seconds, and anything over 1.8 seconds needs improvement. TTFB is influenced by server responsiveness and connection setup time. Lowering it can improve overall user experience and speed.</p>"
          }
        },
        "relatedLinks": {}
      }
    ]
  },
  "seo": {
    "displayName": "SEO",
    "icon": "magnifying-glass",
    "color": "#ffe396",
    "url": "/guidance/seo",
    "description": "ScanGov search engine optimization standards and guidance.",
    "attributes": [
      {
        "key": "status",
        "displayName": "Sitemap status",
        "featured": true,
        "tag": "Status",
        "description": "The HTTP status of /sitemap.xml is OK.",
        "why": "Confirms the sitemap is accessible, ensuring search engines can easily find and index all pages on the site.",
        "error": "Sitemap.xml is missing or inaccessible.",
        "impact": 3,
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>A sitemap is a file that lists all of the pages on a website in addition to information about each so that search engines can more intelligently crawl the site.</p><p>Web crawlers usually discover pages from links within the site and from other sites. Sitemaps supplement this data to allow crawlers that support sitemaps to pick up all Uniform Resources Locators (URLs) in the sitemap and learn about them using the associated metadata. Using sitemap protocol doesn’t guarantee web pages are included in search engines, but provides hints for web crawlers to do a better job of crawling your site.</p><p>The sitemap is an Extensible Markup Language (XML) file on the website’s root directory that include metadata for each URL, such as:</p><ul><li>when it was last updated</li><li>how often it usually changes</li><li>how important it is, relative to other URLs in the site</li></ul>"
          }
        },
        "guidance": [
          {
            "displayName": "sitemaps.org",
            "url": "/sitemaps-org"
          }
        ],
        "userStories": [
          {
            "title": "As a search engine bot or user, I want the website's sitemap to be easily accessible so that I can discover all the pages and content on the site efficiently and improve the website's discoverability."
          }
        ]
      },
      {
        "key": "xml",
        "displayName": "Sitemap XML",
        "tag": "XML",
        "description": "The sitemap file type is XML.",
        "why": "Stores site structure in a readable format, helping search engines efficiently crawl and index all website pages.",
        "error": "Sitemap is not in XML format.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "sitemaps.org",
            "url": "/sitemaps-org"
          }
        ],
        "userStories": [
          {
            "title": "As a search engine bot, I want the website to provide a properly formatted XML sitemap so that I can efficiently crawl and index all relevant pages, improving the site's visibility in search results."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>The sitemap is an Extensible Markup Language (XML) file on the website's root directory that include metadata for each URL, such as:</p><ul>\n  <li>when it was last updated</li>\n  <li>how often it usually changes</li>\n  <li>how important it is, relative to other URLs in the site</li>\n</ul>"
          },
          "example": {
            "title": "Examples",
            "content": "<p>Example government website sitemaps:</p><ul>\n  <li><a href=\"https://www.usa.gov/sitemap.xml\">https://www.usa.gov/sitemap.xml</a></li>\n  <li><a href=\"https://18f.gov/sitemap.xml\">https://18f.gov/sitemap.xml</a></li>\n</ul>"
          },
          "code": {
            "title": "Code",
            "content": "<div class=\"language-html highlighter-rouge\"><div class=\"highlight\"><pre class=\"highlight\"><code><span class=\"cp\">&lt;?xml version=\"1.0\" encoding=\"UTF-8\"?&gt;</span>\n\n<span class=\"nt\">&lt;urlset</span> <span class=\"na\">xmlns=</span><span class=\"s\">\"http://www.sitemaps.org/schemas/sitemap/0.9\"</span><span class=\"nt\">&gt;</span>\n\n   <span class=\"nt\">&lt;url&gt;</span>\n\n      <span class=\"nt\">&lt;loc&gt;</span>http://www.example.com/<span class=\"nt\">&lt;/loc&gt;</span>\n\n      <span class=\"nt\">&lt;lastmod&gt;</span>2005-01-01<span class=\"nt\">&lt;/lastmod&gt;</span>\n\n      <span class=\"nt\">&lt;changefreq&gt;</span>monthly<span class=\"nt\">&lt;/changefreq&gt;</span>\n\n      <span class=\"nt\">&lt;priority&gt;</span>0.8<span class=\"nt\">&lt;/priority&gt;</span>\n\n   <span class=\"nt\">&lt;/url&gt;</span>\n\n<span class=\"nt\">&lt;/urlset&gt;</span>\n</code></pre></div></div>"
          },
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://www.sitemaps.org/\">sitemaps.org</a></li>\n  <li><a href=\"https://en.wikipedia.org/wiki/Sitemaps\">Sitemaps</a> (Wikipedia)</li>\n</ul>"
          }
        },
        "relatedLinks": {
          "audio": "https://standards.scangov.org/assets/audio/sitemaps.mp3"
        }
      },
      {
        "key": "valid",
        "displayName": "Robots valid",
        "featured": true,
        "tag": "Valid",
        "description": "The site has a valid robots policy.",
        "why": "Guides search engines on which pages to crawl or avoid, ensuring important content is indexed and irrelevant pages aren't.",
        "error": "Robots.txt is missing or invalid.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "The Web Robots Pages",
            "url": "/robots"
          }
        ],
        "sections": {
          "guidance": {
            "title": "Guidance",
            "content": "<p>All government websites must allow robots indexing and following.</p>"
          },
          "about": {
            "title": "About",
            "content": "<p>Robots valid means the robots.txt file is correctly written and follows the rules that search engines understand. If it's valid, search engines can read the file and know which parts of the site they can or can't visit. A valid file helps control how your site shows up in search results and avoids errors.</p>"
          },
          "example": {
            "title": "Examples",
            "content": "<p>Example government website robots.txt files:</p><ul>\n  <li><a href=\"https://www.usa.gov/robots.txt\">https://www.usa.gov/robots.txt</a></li>\n  <li><a href=\"https://www.ca.gov/robots.txt\">https://www.ca.gov/robots.txt</a></li>\n</ul>"
          },
          "code": {
            "title": "Code",
            "content": "<p>Example robots.txt code:</p><div class=\"language-yaml highlighter-rouge\"><div class=\"highlight\"><pre class=\"highlight\"><code><span class=\"c1\"># Only applies to search.gov scraping</span>\n<span class=\"na\">User-agent</span><span class=\"pi\">:</span> <span class=\"s\">usasearch</span>  \n<span class=\"c1\"># Slow amount of requests</span>\n<span class=\"na\">Crawl-delay</span><span class=\"pi\">:</span> <span class=\"m\">2</span>\n<span class=\"c1\"># Specify it can read /archive/</span>\n<span class=\"na\">Allow</span><span class=\"pi\">:</span> <span class=\"s\">/archive/</span>\n\n<span class=\"c1\"># Applies to all scrapers</span>\n<span class=\"na\">User-agent</span><span class=\"pi\">:</span> <span class=\"err\">*</span>\n<span class=\"c1\"># Slow amount of requests to 1 every 10 seconds</span>\n<span class=\"na\">Crawl-delay</span><span class=\"pi\">:</span> <span class=\"m\">10</span>\n<span class=\"c1\"># Don't let them read /archive/</span>\n<span class=\"na\">Disallow</span><span class=\"pi\">:</span> <span class=\"s\">/archive/</span>\n\n<span class=\"c1\"># Point to a sitemap file</span>\n<span class=\"na\">Sitemap</span><span class=\"pi\">:</span> <span class=\"s\">/sitemap.xml</span>\n</code></pre></div></div><p>Example robots meta code:</p><div class=\"language-html highlighter-rouge\"><div class=\"highlight\"><pre class=\"highlight\"><code><span class=\"c\">&lt;!-- This page can be indexed \nand links on it can be followed --&gt;</span>\n<span class=\"nt\">&lt;meta</span> <span class=\"na\">name=</span><span class=\"s\">\"robots\"</span> <span class=\"na\">content=</span><span class=\"s\">\"index, follow\"</span><span class=\"nt\">&gt;</span>\n</code></pre></div></div><p>Example X-Robots-Tag:</p><div class=\"language-yaml highlighter-rouge\"><div class=\"highlight\"><pre class=\"highlight\"><code><span class=\"c1\"># This URL can be indexed </span>\n<span class=\"c1\"># and links on it can be followed</span>\n<span class=\"na\">X-Robots-Tag</span><span class=\"pi\">:</span> <span class=\"s\">index, follow</span>\n</code></pre></div></div>"
          },
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://www.robotstxt.org\">robotstxt.org</a></li>\n  <li><a href=\"https://search.gov/indexing/robotstxt.html\">robots.txt</a> (Search.gov)</li>\n  <li><a href=\"https://en.wikipedia.org/wiki/Robots.txt\">robots.txt</a> (Wikipedia)</li>\n  <li><a href=\"https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag\">Robots Meta Tags Specifications</a> (Google)</li>\n</ul>"
          }
        },
        "relatedLinks": {
          "audio": "https://standards.scangov.org/assets/audio/robots-txt.mp3"
        }
      },
      {
        "key": "allowed",
        "displayName": "Robots allowed",
        "tag": "Allowed",
        "description": "The robots policy allows access to browsers and scrapers.",
        "why": "Permits search engines and web tools to access content, helping improve search visibility and gather relevant data.",
        "error": "Robots policy blocks browsers or scrapers.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "The Web Robots Pages",
            "url": "/robots"
          }
        ],
        "userStories": [
          {
            "title": "As a search engine crawler, I want to read the robots.txt file so that I know which parts of the website I am allowed or disallowed to index."
          }
        ],
        "sections": {
          "guidance": {
            "title": "Guidance",
            "content": "<p>All government websites must allow robots indexing and following.</p>"
          },
          "about": {
            "title": "About",
            "content": "<p>Robots allowed in a robots.txt file means search engines like Google are allowed to look at and list (or “crawl”) the page in search results. Website owners use robots.txt to tell search engines what they can and can't see. If robots are allowed, the site or page can show up in search engines, making it easier for people to find.</p>"
          },
          "example": {
            "title": "Examples",
            "content": "<p>Example government website robots.txt files:</p><ul>\n  <li><a href=\"https://www.usa.gov/robots.txt\">https://www.usa.gov/robots.txt</a></li>\n  <li><a href=\"https://www.ca.gov/robots.txt\">https://www.ca.gov/robots.txt</a></li>\n</ul>"
          },
          "code": {
            "title": "Code",
            "content": "<p>Example robots.txt code:</p><div class=\"language-yaml highlighter-rouge\"><div class=\"highlight\"><pre class=\"highlight\"><code><span class=\"c1\"># Only applies to search.gov scraping</span>\n<span class=\"na\">User-agent</span><span class=\"pi\">:</span> <span class=\"s\">usasearch</span>  \n<span class=\"c1\"># Slow amount of requests</span>\n<span class=\"na\">Crawl-delay</span><span class=\"pi\">:</span> <span class=\"m\">2</span>\n<span class=\"c1\"># Specify it can read /archive/</span>\n<span class=\"na\">Allow</span><span class=\"pi\">:</span> <span class=\"s\">/archive/</span>\n\n<span class=\"c1\"># Applies to all scrapers</span>\n<span class=\"na\">User-agent</span><span class=\"pi\">:</span> <span class=\"err\">*</span>\n<span class=\"c1\"># Slow amount of requests to 1 every 10 seconds</span>\n<span class=\"na\">Crawl-delay</span><span class=\"pi\">:</span> <span class=\"m\">10</span>\n<span class=\"c1\"># Don't let them read /archive/</span>\n<span class=\"na\">Disallow</span><span class=\"pi\">:</span> <span class=\"s\">/archive/</span>\n\n<span class=\"c1\"># Point to a sitemap file</span>\n<span class=\"na\">Sitemap</span><span class=\"pi\">:</span> <span class=\"s\">/sitemap.xml</span>\n</code></pre></div></div><p>Example robots meta code:</p><div class=\"language-html highlighter-rouge\"><div class=\"highlight\"><pre class=\"highlight\"><code><span class=\"c\">&lt;!-- This page can be indexed \nand links on it can be followed --&gt;</span>\n<span class=\"nt\">&lt;meta</span> <span class=\"na\">name=</span><span class=\"s\">\"robots\"</span> <span class=\"na\">content=</span><span class=\"s\">\"index, follow\"</span><span class=\"nt\">&gt;</span>\n</code></pre></div></div><p>Example X-Robots-Tag:</p><div class=\"language-yaml highlighter-rouge\"><div class=\"highlight\"><pre class=\"highlight\"><code><span class=\"c1\"># This URL can be indexed </span>\n<span class=\"c1\"># and links on it can be followed</span>\n<span class=\"na\">X-Robots-Tag</span><span class=\"pi\">:</span> <span class=\"s\">index, follow</span>\n</code></pre></div></div>"
          },
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://www.robotstxt.org\">robotstxt.org</a></li>\n  <li><a href=\"https://search.gov/indexing/robotstxt.html\">robots.txt</a> (Search.gov)</li>\n  <li><a href=\"https://en.wikipedia.org/wiki/Robots.txt\">robots.txt</a> (Wikipedia)</li>\n  <li><a href=\"https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag\">Robots Meta Tags Specifications</a> (Google)</li>\n</ul>"
          }
        },
        "relatedLinks": {
          "audio": "https://standards.scangov.org/assets/audio/robots-txt.mp3"
        }
      },
      {
        "key": "sitemap-robots",
        "displayName": "Sitemap in robots.txt",
        "tag": "Sitemap",
        "description": "The robots.txt file points to a sitemap file.",
        "why": "Helps search engines find the sitemap quickly, improving how they discover and index website pages.",
        "error": "robots.txt missing sitemap reference.",
        "impact": 5,
        "guidance": [
          {
            "displayName": "Google Search Central",
            "url": "/google-search-central"
          }
        ],
        "userStories": [
          {
            "title": "As a search engine bot, I want the `robots.txt` file to point to the sitemap so that I can easily discover and crawl the full sitemap of the website, ensuring comprehensive indexing and better visibility in search results."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>A sitemap is a file that lists all of the pages on a website in addition to information about each so that search engines can more intelligently crawl the site.</p><p>Web crawlers usually discover pages from links within the site and from other sites. Sitemaps supplement this data to allow crawlers that support sitemaps to pick up all Uniform Resources Locators (URLs) in the sitemap and learn about them using the associated metadata. Using sitemap protocol doesn't guarantee web pages are included in search engines, but provides hints for web crawlers to do a better job of crawling your site.</p><p>The sitemap is an Extensible Markup Language (XML) file on the website's root directory that include metadata for each URL, such as:</p><ul>\n  <li>when it was last updated</li>\n  <li>how often it usually changes</li>\n  <li>how important it is, relative to other URLs in the site</li>\n</ul>"
          },
          "example": {
            "title": "Examples",
            "content": "<p>Example government website sitemaps:</p><ul>\n  <li><a href=\"https://www.usa.gov/sitemap.xml\">https://www.usa.gov/sitemap.xml</a></li>\n  <li><a href=\"https://18f.gov/sitemap.xml\">https://18f.gov/sitemap.xml</a></li>\n</ul>"
          },
          "code": {
            "title": "Code",
            "content": "<div class=\"language-html highlighter-rouge\"><div class=\"highlight\"><pre class=\"highlight\"><code><span class=\"cp\">&lt;?xml version=\"1.0\" encoding=\"UTF-8\"?&gt;</span>\n\n<span class=\"nt\">&lt;urlset</span> <span class=\"na\">xmlns=</span><span class=\"s\">\"http://www.sitemaps.org/schemas/sitemap/0.9\"</span><span class=\"nt\">&gt;</span>\n\n   <span class=\"nt\">&lt;url&gt;</span>\n\n      <span class=\"nt\">&lt;loc&gt;</span>http://www.example.com/<span class=\"nt\">&lt;/loc&gt;</span>\n\n      <span class=\"nt\">&lt;lastmod&gt;</span>2005-01-01<span class=\"nt\">&lt;/lastmod&gt;</span>\n\n      <span class=\"nt\">&lt;changefreq&gt;</span>monthly<span class=\"nt\">&lt;/changefreq&gt;</span>\n\n      <span class=\"nt\">&lt;priority&gt;</span>0.8<span class=\"nt\">&lt;/priority&gt;</span>\n\n   <span class=\"nt\">&lt;/url&gt;</span>\n\n<span class=\"nt\">&lt;/urlset&gt;</span>\n</code></pre></div></div>"
          },
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://www.sitemaps.org/\">sitemaps.org</a></li>\n  <li><a href=\"https://en.wikipedia.org/wiki/Sitemaps\">Sitemaps</a> (Wikipedia)</li>\n</ul>"
          }
        },
        "relatedLinks": {
          "audio": "https://standards.scangov.org/assets/audio/sitemaps.mp3"
        }
      },
      {
        "key": "canonical",
        "displayName": "Canonical",
        "tag": "<link rel=\"canonical\">",
        "description": "Use preferred page URLs to avoid duplication.",
        "why": "Prevents duplicate content issues by telling search engines which version of a page is the main one.",
        "error": "Duplicate page URLs detected.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "The Web Robots Pages",
            "url": "/robots"
          },
          {
            "displayName": "Google Search Central",
            "url": "/google-search-central"
          }
        ],
        "userStories": [
          {
            "title": "As a user or search engine bot, I want to be directed to the preferred version of a webpage (canonical URL) to avoid duplicate content and ensure that I am viewing the correct page with the most relevant content."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>Canonicalization ensures that search engines index the correct version of a page when there are duplicate or similar pages. By specifying a canonical URL with the <code class=\"language-plaintext highlighter-rouge\">rel=\"canonical\"</code> tag, you direct search engines to the primary page, helping improve SEO. This prevents search engines from splitting the ranking between multiple pages with similar content. Proper canonicalization avoids indexing issues and boosts a site's performance in search results.</p>"
          },
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://developers.google.com/search/docs/crawling-indexing/canonicalization\">Google canonicalization guide</a></li>\n</ul>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "link-text",
        "displayName": "Link text",
        "tag": "link-text",
        "description": "Links have descriptive text.",
        "why": "Describes the link’s purpose clearly, helping users know where it leads and improving navigation for everyone.",
        "error": "Links do not have descriptive text.",
        "impact": 1,
        "guidance": [
          {
            "displayName": "Google Search Central",
            "url": "/google-search-central"
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>Link text is the clickable word or phrase in a hyperlink. When link text clearly conveys a hyperlink's target, both users and search engines can more easily understand your content and how it relates to other pages.</p>"
          },
          "links": {
            "title": "Links",
            "content": "<ul><li><a href=\"https://developer.chrome.com/docs/lighthouse/seo/link-text/\">Links do not have descriptive text</a></li>\n</ul>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "hreflang",
        "displayName": "hreflang",
        "tag": "hreflang",
        "description": "Specifies language and region for webpages.",
        "why": "Indicates page language and region, helping users see the right version and improving search results in different countries.",
        "error": "The pages has a missing or invalid hreflang attribute.",
        "impact": 1,
        "guidance": [
          {
            "displayName": "Google Search Central",
            "url": "/google-search-central"
          }
        ],
        "userStories": [
          {
            "title": "As a website visitor, I want to see the page in my language so I can easily understand the content."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>The `hreflang` attribute helps search engines understand which language and region a webpage is targeting. This is useful when a website has multiple versions in different languages or for different regions. By using `hreflang`, the site can show the correct version of a page to users based on their language or location, improving their experience. It also helps search engines avoid showing the wrong language version in search results, leading to better SEO and user engagement.</p>"
          },
          "links": {
            "title": "Links",
            "content": "<ul><li><a href=\"https://developer.chrome.com/docs/lighthouse/seo/hreflang/\">Document doesn't have a valid hreflang</a></li><li><a href=\"https://developers.google.com/search/docs/specialty/international/localized-versions\">Tell Google about localized versions of your page</a></li></ul>"
          }
        },
        "relatedLinks": {}
      }
    ]
  },
  "security": {
    "displayName": "Security",
    "icon": "lock",
    "color": "#ff8d7b",
    "url": "/guidance/security",
    "description": "ScanGov security standards and guidance.",
    "attributes": [
      {
        "key": "csp",
        "displayName": "Content security policy (CSP)",
        "featured": true,
        "tag": "CSP",
        "description": "The site restricts what can be loaded.",
        "why": "Helps stop hackers by blocking harmful code from running on your website.",
        "error": "Content Security Policy is missing or too permissive.",
        "impact": 3,
        "guidance": [
          {
            "displayName": "CISA Website Security",
            "url": "/websitesecurity-cisa"
          }
        ],
        "userStories": [
          {
            "title": "As a website owner, I want to define a Content Security Policy so that I can prevent malicious scripts from executing and protect users from XSS attacks."
          },
          {
            "title": "As a site visitor, I want the website to load safely and securely without being exposed to malicious content or scripts so that my browsing experience is safe and my data is protected."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p><strong>Content Security Policy (CSP)</strong> is a security standard that helps protect websites from attacks like cross-site scripting (XSS) by allowing website owners to declare trusted sources of content.</p><p>CSP is delivered using HTTP headers or HTML meta tags, and uses directives like <code class=\"language-plaintext highlighter-rouge\">default-src</code>, <code class=\"language-plaintext highlighter-rouge\">script-src</code>, and <code class=\"language-plaintext highlighter-rouge\">img-src</code> to control resource loading. CSP can enforce policies, report violations, and is not a replacement for careful input validation, but a defense-in-depth measure. <strong>Strict CSP</strong> is more secure using nonces or hashes.</p><p>Note: It's an extra layer of protection, not the primary defense.</p>"
          },
          "code": {
            "title": "Code",
            "content": "<p>Example header:</p><div class=\"language-yaml highlighter-rouge\"><div class=\"highlight\"><pre class=\"highlight\"><code><span class=\"na\">Content-Security-Policy</span><span class=\"pi\">:</span>\n  <span class=\"s\">default-src 'self';</span>\n  <span class=\"s\">script-src 'self' https://example.gov;</span>\n  <span class=\"s\">style-src 'self' 'unsafe-inline';</span>\n  <span class=\"s\">img-src 'self' https://example.gov;</span>\n  <span class=\"s\">font-src 'self' https://example.gov;</span>\n  <span class=\"s\">object-src 'none';</span>\n  <span class=\"s\">frame-ancestors 'none';</span>\n  <span class=\"s\">upgrade-insecure-requests;</span>\n</code></pre></div></div><p>Example HTML code:</p><div class=\"language-html highlighter-rouge\"><div class=\"highlight\"><pre class=\"highlight\"><code><span class=\"c\">&lt;!-- Content Security Policy example using meta tag --&gt;</span>\n<span class=\"nt\">&lt;meta</span> <span class=\"na\">http-equiv=</span><span class=\"s\">\"Content-Security-Policy\"</span> <span class=\"na\">content=</span><span class=\"s\">\"\n  default-src 'self';\n  script-src 'self' https://example.gov;\n  style-src 'self' 'unsafe-inline';\n  img-src 'self' https://example.gov;\n  font-src 'self' https://example.gov;\n  object-src 'none';\n  frame-ancestors 'none';\n  upgrade-insecure-requests;\n\"</span><span class=\"nt\">&gt;</span>\n</code></pre></div></div>"
          },
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://guides.18f.gov/engineering/security/content-security-policy/\">Content Security Policy</a> (18F)</li>\n  <li><a href=\"https://research.sidstamm.com/papers/csp-www2010.pdf\">Reining in the Web with Content Security Policy</a> (Mozilla)</li>\n  <li><a href=\"https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP\">Content Security Policy</a> (Mozilla)</li>\n  <li><a href=\"https://www.w3.org/TR/CSP3/\">Content Security Policy Level 3</a> (W3C)</li>\n  <li><a href=\"https://en.wikipedia.org/wiki/Content_Security_Policy\">Content Security Policy</a> (Wikipedia)</li>\n  <li><a href=\"https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html\">Content Security Policy Cheat Sheet</a> (OWASP)</li>\n</ul>"
          }
        },
        "relatedLinks": {
          "audio": "https://standards.scangov.org/assets/audio/content-security-policy.mp3"
        }
      },
      {
        "key": "hsts",
        "displayName": "HTTP Strict Transport Security (HSTS)",
        "featured": true,
        "tag": "HSTS",
        "description": "Site upgrades to a secure connection.",
        "why": "Forces secure connections, protecting user data by making websites always load with encryption.",
        "error": "Site doesn't force secure connection; easier for hackers to intercept.",
        "impact": 10,
        "guidance": [
          {
            "displayName": "21st Century Integrated Digital Experience Act",
            "url": "/21stcenturyidea"
          },
          {
            "displayName": "CISA Website Security",
            "url": "/websitesecurity-cisa"
          },
          {
            "displayName": "CISA Cybersecurity Performance Goals",
            "url": "/cybersecurity-performance-goals"
          },
          {
            "displayName": "Memorandum (M-23-22)",
            "url": "/memorandum-m-23-22"
          }
        ],
        "userStories": [
          {
            "title": "As a site visitor, I want the website to automatically redirect to HTTPS and prevent any connection via HTTP so that my data is always encrypted and secure during transmission."
          }
        ],
        "sections": {
          "guidance": {
            "title": "Guidance",
            "content": "<p>All government websites must have HSTS.</p><p><a href=\"https://www.whitehouse.gov/wp-content/uploads/legacy_drupal_files/omb/memoranda/2015/m-15-13.pdf\">M-15-13</a>:</p><blockquote>\n  <p>Strict Transport Security: Websites and services available over HTTPS must enable HTTP Strict Transport Security (HSTS)12 to instruct compliant browsers to assume HTTPS going forward. This reduces the number of insecure redirects, and protects users against attacks that attempt to downgrade connections to plain HTTP. Once HSTS is in place, domains can be submitted to a “preload list”13 used by all major browsers to ensure the HSTS policy is in effect at all times.</p>\n</blockquote><p><a href=\"https://https.cio.gov/hsts/\">CIO.gov</a>:</p><blockquote>\n  <p>The policy should be deployed at https://domain.gov, not https://www.domain.gov.</p>\n</blockquote>"
          },
          "about": {
            "title": "About",
            "content": "<p>HTTP Strict Transport Security is a security feature that:</p><ul>\n  <li>Forces web browsers to use HTTPS instead of HTTP.</li>\n  <li>Protects against downgrade attacks and cookie hijacking.</li>\n  <li>Specifies a period during which the browser should enforce HTTPS for the site.</li>\n</ul><p>Key points:</p><ul>\n  <li>Activated by the server through a response header (<code class=\"language-plaintext highlighter-rouge\">Strict-Transport-Security</code>).</li>\n  <li>Helps improve website security by ensuring encrypted connections.</li>\n</ul>"
          },
          "code": {
            "title": "Code",
            "content": "<p>Example header:</p><p><code class=\"language-plaintext highlighter-rouge\">Strict-Transport-Security: max-age=31536000; includeSubDomains; preload</code></p>"
          },
          "links": {
            "title": "Links",
            "content": "<ul>\n  <li><a href=\"https://https.cio.gov/hsts/\">HTTP Strict Transport Security</a> (CIO.gov)</li>\n  <li><a href=\"https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/\">HTTP Strict Transport Security</a> (Mozilla)</li>\n  <li><a href=\"https://cloud.gov/docs/management/headers/\">Security-related HTTP headers</a> (Cloud.gov)</li>\n  <li><a href=\"https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html\">HTTP Strict Transport Security Cheat Sheet</a> (OWASP)</li>\n  <li><a href=\"https://en.wikipedia.org/wiki/HTTP_Strict_Transport_Security\">HTTP Strict Transport Security</a> (Wikipedia)</li>\n</ul>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "securityTxt",
        "displayName": "security.txt",
        "featured": true,
        "tag": "security.txt",
        "description": "The site has a security.txt file.",
        "why": "Provides contact info for reporting security issues, helping site owners fix problems quickly and keep users safe.",
        "error": "No available security.txt file.",
        "impact": 1,
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>security.txt is a text file located on the site root-level or `/.well-known/` directory that helps improve vulnerability disclosure by giving security researchers clear contact and reporting information.</p><p>security.txt is an accepted standard (<a href=\"https://www.rfc-editor.org/rfc/rfc9116\">RFC 9116</a>) by the <a href=\"https://en.wikipedia.org/wiki/Internet_Engineering_Task_Force\">Internet Engineering Task Force</a>.</p>"
          }
        },
        "guidance": [
          {
            "displayName": "CISA Cybersecurity Performance Goals",
            "url": "/cybersecurity-performance-goals"
          },
          {
            "displayName": "RFC 9116",
            "url": "/rfc9116"
          }
        ],
        "userStories": [
          {
            "title": "As a security researcher, I want to find a security.txt file on the website so that I can report vulnerabilities to the right contact securely and efficiently."
          }
        ]
      },
      {
        "key": "xContentTypeOptions",
        "displayName": "X-Content-Type-Options",
        "tag": "X-Content-Type-Options",
        "description": "The site prevents mime type sniffing.",
        "why": "Stops browsers from guessing file types, helping prevent security risks by enforcing correct content handling.",
        "error": "Missing or wrong X-Content-Type-Options setting.",
        "impact": 3,
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>`X-Content-Type-Options` is a security header that:</p><ul><li>Prevents browsers from MIME-sniffing.</li><li>Ensures content is rendered as declared (e.g., no misinterpretation of file types).</li><li>Stops browsers from guessing content types, enhancing security.</li></ul>"
          }
        },
        "guidance": [
          {
            "displayName": "OWASP Top 10",
            "url": "/owasp-top-10"
          }
        ]
      },
      {
        "key": "errors_in_console",
        "displayName": "Errors in the console",
        "tag": "errors-in-console",
        "description": "Tracks mistakes in code for debugging.",
        "why": "Signals problems in website code, helping developers fix issues that could affect how the site works or displays.",
        "error": "Page load problem — check browser console for errors and details.",
        "impact": 1,
        "guidance": [],
        "userStories": [
          {
            "title": "As a security researcher, I want to find a security.txt file on the website so that I can report vulnerabilities to the right contact securely and efficiently."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>Errors logged to the console help developers find and fix problems in their code. When something goes wrong, like a bug or incorrect function, the console displays a message with details about the issue. This helps developers understand what went wrong, where it happened, and what needs to be fixed. By using the console, developers can troubleshoot and improve their websites or applications, making them run more smoothly for users.</p>"
          }
        },
        "links": {
          "title": "Links",
          "content": "<ul>\n  <li><a href=\"https://developer.chrome.com/docs/lighthouse/best-practices/errors-in-console/\">Browser errors were logged to the console</a> (Google Lighthouse)</li>\n</ul>"
        }
      },
      {
        "key": "clickjacking_mitigation",
        "displayName": "Clickjacking mitigation",
        "tag": "clickjacking-mitigation",
        "description": "Stops fake clicks on hidden content.",
        "why": "Prevents malicious websites from tricking users into clicking hidden elements, enhancing site security and protecting user actions.",
        "error": "Page is not protected from possible clickjacking by containing frames.",
        "impact": 1,
        "guidance": [
          {
            "displayName": "OWASP Top 10",
            "url": "/owasp-top-10"
          }
        ],
        "userStories": [
          {
            "title": "As a user, I want to safely click buttons and links so I'm not tricked into doing something I didn't mean to."
          }
        ],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>Clickjacking is a malicious attack where users are tricked into clicking on links or user interface elements on a site that appears to be a trusted and familiar site. This is typically accomplished by embedding part or all of the trusted site into the malicious site using an &lt;iframe&gt;.</p><p>The X-Frame-Options (XFO) header and the frame-ancestors directive in the Content-Security-Policy (CSP) header can mitigate clickjacking attacks by controlling how a site can be embedded within an $lt;iframe>.</p>"
          },
          "links": {
            "title": "Links",
            "content": "<ul><li><a href=\"https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/Clickjacking\">Clickjacking</a> (Mozilla)</li><li><a href=\"https://owasp.org/www-community/attacks/Clickjacking\">Clickjacking</a> (OWASP)</li></ul>"
          }
        },
        "relatedLinks": {}
      },
      {
        "key": "paste_preventing_inputs",
        "displayName": "Paste preventing inputs",
        "tag": "paste-preventing-inputs",
        "description": "Page doesn't allow copy-paste into inputs.",
        "why": "Negatively impacts user experience and weakens security by blocking password managers.",
        "error": "Page doesn't allow copy-paste into inputs.",
        "impact": 1,
        "guidance": [],
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>Some websites claim that allowing users to paste passwords reduces security. However, password pasting actually improves security because it enables the use of password managers.</p><p>Password managers typically generate strong passwords for users, store them securely, and then automatically paste them into password fields whenever users need to log in. This approach is generally more secure than forcing users to type in passwords that are short enough to remember.</p><p>In the general case, users should not be prevented from pasting into <code>&lt;input&gt;</code> elements.</p>"
          },
          "code": {
            "title": "Code",
            "content": "<code>&lt;input type=&quot;text&quot; /&gt;</code>"
          },
          "links": {
            "title": "Links",
            "content": "<ul><li><a href=\"https://developer.chrome.com/docs/lighthouse/best-practices/paste-preventing-inputs/\">Prevents users from pasting into input fields</a></li></ul>"
          }
        },
        "relatedLinks": {}
      }
    ]
  },
  "social": {
    "displayName": "Social",
    "icon": "share-nodes",
    "color": "#e7f434",
    "url": "/guidance/social",
    "description": "ScanGov social media standards and guidance.",
    "attributes": [
      {
        "key": "ogSiteName",
        "displayName": "Open Graph site name",
        "tag": "<meta property=\"og:site-name\">",
        "description": "Website title for social sharing.",
        "why": "Sets the website's title for social media sharing, ensuring consistent branding and better previews when content is shared.",
        "error": "Open Graph site name is missing.",
        "impact": 1,
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>The Open Graph site name tag helps define the name of the website when content is shared on social media platforms. This tag is important for consistency in branding across social media and ensures that the website is properly identified when users share content. Without it, the default title might be used, which can lead to incorrect or incomplete branding."
          }
        },
        "guidance": [
          {
            "displayName": "Open Graph",
            "url": "/open-graph"
          }
        ],
        "userStories": [
          {
            "title": "As a site visitor, I want rich and visually appealing previews when a website is shared on social media so that I can easily understand the content and decide whether to click on the link."
          }
        ]
      },
      {
        "key": "ogType",
        "displayName": "Open Graph type",
        "tag": "<meta property=\"og:type\">",
        "description": "Content category for social media.",
        "why": "Specifies content type for social media, improving how links are displayed and enhancing engagement when shared online.",
        "error": "Open Graph type is missing.",
        "impact": 1,
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>The Open Graph type tag specifies the type of content being shared (e.g., website, article, video, etc.) and helps social media platforms understand how to render the content. It allows for better control over how the shared content is presented, ensuring that the correct type of preview is displayed, which enhances user engagement. Without this tag, the content may not display optimally on social platforms."
          }
        },
        "guidance": [
          {
            "displayName": "Open Graph",
            "url": "/open-graph"
          }
        ],
        "userStories": [
          {
            "title": "As a site visitor, I want the content shared from the website to display the correct type of information (e.g., article, video, website) so that I can easily understand the context and purpose of the link before clicking on it."
          }
        ]
      },
      {
        "key": "ogTitle",
        "displayName": "Open Graph title",
        "featured": true,
        "tag": "<meta property=\"og:title\">",
        "description": "Page title for social sharing.",
        "why": "Sets a clear title for shared content, ensuring accurate and engaging previews on social media platforms.",
        "error": "Open Graph title is missing.",
        "impact": 1,
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>The Open Graph title tag defines the title of the page when it is shared on social media platforms. It ensures that the title appears clearly and accurately on platforms like Facebook, Twitter, and LinkedIn. Without a well-defined Open Graph title, social media platforms may default to the page's title or pick a less relevant part of the page content, leading to poor user engagement and a less polished appearance on social media."
          }
        },
        "guidance": [
          {
            "displayName": "Open Graph",
            "url": "/open-graph"
          }
        ],
        "userStories": [
          {
            "title": "As a site visitor, I want the title of the shared content to be clear and descriptive so that I can easily understand what the link is about before clicking on it."
          }
        ]
      },
      {
        "key": "ogDescription",
        "displayName": "Open Graph description",
        "tag": "<meta property=\"og:description\">",
        "description": "Short description of your webpage content.",
        "why": "Provides a brief summary of content, helping users understand what the link is about when shared on social media.",
        "error": "Open Graph description is missing.",
        "impact": 1,
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>The Open Graph description tag specifies the description that will be shown when the page is shared on social media platforms. It plays a crucial role in providing a concise and engaging summary of the page's content. Without a well-defined Open Graph description, social platforms may default to content from the page itself, which could lead to inaccurate or unappealing descriptions, potentially reducing click-through rates and user engagement on social media."
          }
        },
        "guidance": [
          {
            "displayName": "Open Graph",
            "url": "/open-graph"
          }
        ],
        "userStories": [
          {
            "title": "As a site visitor, I want the description of shared content to be informative and concise so that I can quickly understand what the content is about before deciding to click the link."
          }
        ]
      },
      {
        "key": "ogUrl",
        "displayName": "Open Graph URL",
        "tag": "<meta property=\"og:url\">",
        "description": "Canonical link for social sharing.",
        "why": "Defines the URL of the shared content, ensuring correct linking and improving how the page is displayed on social media.",
        "error": "Canonical link missing.",
        "impact": 1,
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>The Open Graph URL tag provides the canonical URL for the content, which is essential for social media platforms to know which page to link to when shared. If the URL is missing or incorrect, social media platforms may not correctly associate the content with the intended page, potentially causing issues like broken links or the sharing of the wrong page, which could affect user engagement and SEO performance."
          }
        },
        "guidance": [
          {
            "displayName": "Open Graph",
            "url": "/open-graph"
          }
        ],
        "userStories": [
          {
            "title": "As a site visitor, I want the shared content to link to the correct webpage, so that I can be sure I am clicking the right link and accessing the intended content."
          }
        ]
      },
      {
        "key": "ogImage",
        "displayName": "Open Graph image",
        "tag": "<meta property=\"og:image\">",
        "description": "Preview image for social sharing.",
        "why": "Sets an image for social media previews, improving engagement by displaying relevant visuals when content is shared.",
        "error": "Open Graph image is missing.",
        "impact": 1,
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>The Open Graph image tag is used to specify a preview image that appears when a page is shared on social media. Without this tag, social media platforms may not display any image, or they might display an irrelevant image, which could negatively affect user engagement and click-through rates. Including a proper Open Graph image ensures that the page looks attractive and engaging when shared on platforms like Facebook, X, and LinkedIn."
          }
        },
        "guidance": [
          {
            "displayName": "Open Graph",
            "url": "/open-graph"
          }
        ],
        "userStories": [
          {
            "title": "As a social media user, I want shared links to have a clear and relevant image so that I can easily understand the content of the link before clicking on it."
          }
        ]
      },
      {
        "key": "ogImageAlt",
        "displayName": "Open Graph image alt",
        "tag": "<meta property=\"og:image:alt\">",
        "description": "Image description for accessibility",
        "why": "Provides a description for the image, improving accessibility and helping search engines understand the image content.",
        "error": "Open Graph image alt is missing.",
        "impact": 1,
        "sections": {
          "about": {
            "title": "About",
            "content": "<p>The Open Graph image alt tag provides alternative text for the image specified in the Open Graph protocol. This helps improve accessibility for users with visual impairments, as screen readers can describe the image content. Additionally, providing alt text ensures that the content of the image is still conveyed in cases where the image cannot be loaded or viewed, contributing to a better user experience and broader reach."
          }
        },
        "guidance": [
          {
            "displayName": "Open Graph",
            "url": "/open-graph"
          }
        ],
        "userStories": [
          {
            "title": "As a site visitor, I want the image shared on social media to have an alt text so that I can understand the content of the image even if I can't see it, especially if I rely on screen readers."
          }
        ]
      }
    ]
  }
};

  return auditData;
}

