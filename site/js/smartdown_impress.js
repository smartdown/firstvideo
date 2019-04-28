/* global smartdown */
/* global window */
/* global smartdownBaseURL */
/* global smartdownDefaultHome */
/* global smartdownRawPrefix */
/* global smartdownOutputDivSelector */
/* global smartdownPostLoadMutator */
/* global smartdownMedia */
/* global XMLHttpRequest */
/* eslint no-var: 0 */

var themeName = '';

var defaultHome = 'Home';

var baseURL = 'https://unpkg.com/smartdown/dist/';
var resourceURL = 'https://unpkg.com/smartdown-gallery/resources/';
var rawPrefix = window.location.origin + window.location.pathname;
var outputDivSelector = '#smartdown-output';
var postLoadMutator = null;
var media = {
  cloud: '/gallery/resources/cloud.jpg',
  badge: '/gallery/resources/badge.svg',
  hypercube: '/gallery/resources/Hypercube.svg',
  StalactiteStalagmite: '/gallery/resources/StalactiteStalagmite.svg',
  church: '/gallery/resources/church.svg',
  lighthouse: '/gallery/resources/lighthouse.svg',
  barn: '/gallery/resources/barn.svg',
  'medieval-gate': '/gallery/resources/medieval-gate.svg'
};
var multiparts = {};

if (typeof smartdownDefaultHome === 'string') {
  defaultHome = smartdownDefaultHome;
}
if (typeof smartdownRawPrefix === 'string') {
  rawPrefix = smartdownRawPrefix;
}
if (typeof smartdownOutputDivSelector === 'string') {
  outputDivSelector = smartdownOutputDivSelector;
}
if (typeof smartdownPostLoadMutator === 'function') {
  postLoadMutator = smartdownPostLoadMutator;
}

if (typeof smartdownMedia === 'object') {
  media = Object.assign(media, smartdownMedia);
}

var lastLoadedRawPrefix = rawPrefix;

var calcHandlers = smartdown.defaultCalcHandlers;
var replace = rawPrefix;

const linkRules = [
    {
      prefix: 'assets/',
      replace: replace + 'assets/'
    },
    {
      prefix: '/assets/',
      replace: replace + 'assets/'
    },
    {
      prefix: 'content/',
      replace: replace + 'content/'
    },
    {
      prefix: '/content/',
      replace: replace + 'content/'
    },
    {
      prefix: '/gallery/resources/',
      replace: resourceURL === '' ? '/gallery/resources/' : resourceURL
    },
    {
      prefix: '/resources/',
      replace: resourceURL === '' ? '/resources/' : resourceURL
    },
];


const cardNameToDivMap = {};

function applyFrontmatter(element, frontMatter) {
  if (frontMatter.frontmatter) {
    const impress = frontMatter.frontmatter.impress;
    const impressKeys = Object.keys(impress);

    for (keyIndex in impressKeys) {
      const key = impressKeys[keyIndex];
      element.setAttribute(key, `${impress[key]}`);
      // console.log('fm', element, key, impress[key], element.getAttribute(key));
    }
    element.frontmatter = frontMatter.frontmatter;
  }
  element.md = frontMatter.markdown;
}

function expandElement(element, textContent) {
  var id = element.id;
  const parentNode = element.parentNode;
  const fm = smartdown.getFrontmatter(textContent);

  applyFrontmatter(element, fm);

  var slides = [];

  const multiparts = smartdown.partitionMultipart(fm.markdown);
  const multipartKeys = Object.keys(multiparts);
  // console.log('expandElement', textContent.slice(0, 20), fm, multipartKeys);

  if (multipartKeys.length === 1) {
    slides.push({
      key: element.id,
      text: fm.markdown
    });
  }
  else {
    multipartKeys.forEach((k) => {
      slides.push({
        key: k,
        text: multiparts[k]
      });
    });
  }

  element.md = slides[0].text;
  element.id = slides[0].key;
  cardNameToDivMap[`${slides[0].key}`] = element;
  cardNameToDivMap[`${id}`] = element;

  if (slides.length > 1) {
    var nextSibling = element.nextSibling;
    for (var slideIndex = 1; slideIndex < slides.length; ++slideIndex) {
      const slideKey = slides[slideIndex].key;
      if (slideKey !== '_default_') {
        var newElement = element.cloneNode( false );
        newElement.removeAttribute('data-x');
        newElement.removeAttribute('data-y');
        newElement.md = slides[slideIndex].text;
        newElement.id = slideKey;
        cardNameToDivMap[slides[slideIndex].text] = newElement;
        applyFrontmatter(newElement, smartdown.getFrontmatter(newElement.md));
        parentNode.insertBefore(newElement, nextSibling);
        nextSibling = newElement.nextSibling;
      }
    }
  }
}


function unindentText(indentedText) {
  let result = indentedText;

  const match = indentedText.match(/^[ \t]*(?=\S)/gm);
  if (match) {
    const indent = Math.min.apply(Math, match.map(x => x.length));

    const re = new RegExp(`^[ \\t]{${indent}}`, 'gm');
    result = indentedText.replace(re, '');
  }

  return result;
}

function generateExternalSlideDiv() {

}

function applyText(element, text) {
  var frontMatter = smartdown.getFrontmatter(text);
  if (frontMatter) {
    var id = element.id;
    var parentNode = element.parentNode;
    var impressFM = frontMatter.frontmatter.impress;
    if (impressFM) {
      if (impressFM.persistence) {
        smartdown.setPersistence(impressFM.persistence);
      }
      applyFrontmatter(element, frontMatter);
      if (impressFM.files) {
        for (let i = 0; i < impressFM.files.length; ++i) {
          var file = impressFM.files[i];
          var newElement = element.cloneNode( false );
          if (i > 0) {
            newElement.removeAttribute('data-x');
            newElement.removeAttribute('data-y');
          }
          newElement.setAttribute('src', file);
          newElement.classList.remove('manifest');
          let strippedFilename = file;
          if (strippedFilename.indexOf('./') === 0) {
            strippedFilename = strippedFilename.slice(2);
          }
          if (strippedFilename.endsWith('.md')) {
            strippedFilename = strippedFilename.slice(0, -3);
          }
          newElement.id = `${strippedFilename}`;
          cardNameToDivMap[`${strippedFilename}`] = newElement;
          parentNode.insertBefore(newElement, element);
        }
      }
    }
  }
  parentNode.removeChild(element);
}


function loadManifests(done) {
  var manifestDivs = document.querySelectorAll( ".smartdown.manifest" );
  let numRemaining = manifestDivs.length;
  if (numRemaining === 0) {
    done();
  }
  else {
    var element = manifestDivs[0];
    // console.log('element', element);
    var externalSrc = element.getAttribute('src');
    var text = unindentText(element.textContent);
    element.classList.remove('manifest');

    if (externalSrc) {
      var xhr = new XMLHttpRequest();
      xhr.addEventListener('load', function() {
        applyText(element, this.responseText);
        loadManifests(done);
      });
      xhr.open('GET', externalSrc);
      xhr.send();
    }
    else {
      applyText(element, text);
      loadManifests(done);
    }
  }
}


function buildExpandedDivs(done) {
  var smartdownDivs = document.querySelectorAll( ".smartdown" );
  let numRemaining = smartdownDivs.length;
  if (numRemaining === 0) {
    done();
  }
  else {
    for (var idx = 0; idx < smartdownDivs.length; idx++) {
      var element = smartdownDivs[ idx ];
      const externalSrc = element.getAttribute('src');
      const text = unindentText(element.textContent);

      if (externalSrc) {
        const saveId = element.id;
        var xhr = new XMLHttpRequest();
        xhr.addEventListener('load', function() {
          element = document.getElementById(saveId);
          // element.md = this.responseText;
          expandElement(element, this.responseText);
          --numRemaining;
          if (numRemaining === 0) {
            done();
          }
        });
        xhr.open('GET', externalSrc);
        xhr.send();
      }
      else {
        expandElement(element, text);
        --numRemaining;
        if (numRemaining === 0) {
          done();
        }
      }
    }
  }
}

let api = null;

function applySmartdown() {
  // console.log(JSON.stringify(cardNameToDivMap, null, 2));

  var smartdownDivs = document.querySelectorAll( '.smartdown' );

  let numDivs = smartdownDivs.length;
  let whichDiv = 0;

  function recursiveApply(done) {
    if (whichDiv === numDivs) {
      done();
    }
    else {
      var element = smartdownDivs[ whichDiv ];
      var id = element.id;
      ++whichDiv;

      element.innerHTML = element.md;
      window.smartdown.setSmartdown(element.md, element, function() {
        element.classList.remove('loading');
        recursiveApply(done);
      });
    }
  }

  recursiveApply(function() {
    if (!api) {
      api = impress();
      api.init();
    }
    window.setTimeout(_ => {
      window.smartdown.startAutoplay(document.getElementById('smartdown-container'));
    }, 10);
  });
}


function cardLoader(cardKey) {
  let impressKey = cardKey;
  if (cardKey.indexOf('/') < 0 && cardKey.indexOf(':') >= 0) {
    const keyParts = cardKey.split(':');
    impressKey = keyParts[keyParts.length - 1];
  }
  // console.log('cardLoader', cardKey, impressKey);
  api.goto(impressKey);
}

loadManifests(function() {
  buildExpandedDivs(function() {
    smartdown.initialize(media, baseURL, applySmartdown, cardLoader, calcHandlers, linkRules);
  });
})
