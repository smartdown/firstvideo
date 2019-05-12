## smartdown/firstvideo

This is an experiment to see if a promotional informative video for Smartdown can be storyboarded, and possibly generated, from a set of Smartdown documents.

The basic idea is to use [smartdown/impress](https://github.com/smartdown/impress) (demo [here](https://smartdown.github.io/impress/)) to build a set of Smartdown documents and arrange them in a presentation that can be used as a basis for generating a conventional video. A side-effect might be that a useful interactive hypertext Smartdown presentation might be developed, but that is not a primary goal.

### What's going on here?

I copied [smartdown/impress](https://github.com/smartdown/impress) and deleted the examples that were 'exampleBasic'. I then repurposed that example to be this 'firstvideo' repo.

### What's the Point?

A lot of folks I've tried to approach with Smartdown (for funding or adoption or feedback) have requested a video. So a video is useful as a means of getting people to understand the potential applications and utility of Smartdown. But of course we need to geek out and *eat our own dogfood* by using Smartdown to produce its own video, much like using Smartdown to create its own [logo](https://doctorbud.com/celestial-toys/post/2018-10-08-building-a-logo-part-1/#index).

### What's the Plan?

- Author a set of Smartdown documents that each isolate a particular *frame* or *scene* that might become part of a final video (or hypertext presentation).
- Gradually refine and restructure the content so that it serializes into a credible video.
- Use Text, Audio, ScreenCasts, and Video to tell a story.
- Use this storyboard as a guide towards creating a serialized video.
- Ideally, generate this video mechanically from the Smartdown source content and metadata.


## Contributing

### Fork this repo

To effectively use the `ghpublish` capability described below, you will want to be using a fork of this repo.

- Fork the repo
- Get the URL for your fork
- `git clone` the fork using the above URL
- Add a git remote reference pointing to this repo. For example, `upstream` or `integration` could be a remote name.

### How to build

```bash
cd firstvideo/
npm run dev
open https://localhost:5002 # Alternatively, type URL into a browser

```


### Publish to GitHub Pages

The `ghpublish` command will invoke `publish.sh` to deploy the current contents of `site/` to the `gh-pages` branch of this repo. 
```bash
npm run ghpublish
```

### Directory Layout

- site/ - The source for the website that will be pushed to gh-pages via publish.sh
- raw/ - Contains notes, videos, docs, images, slideshows, and other *raw material* that will become part of or inform the storyboard. Typically, stuff will be extracted from these files and placed at the appropriate location in the site/ tree.
- site/index.html - A top-level index pointing to the primary storyboard(s), as well as possibly other resources/projects within site/.
- site/css/ - Contains smartdown-impress.css which is identical with the corresponding files in smartdown/impress. Custom per-storyboard CSS overrides should be in site/storyboard/storyboard.css.
- site/js/ - Contains impress.js, smartdown_impress.js, and starter.js, which are currently identical with the corresponding files in smartdown/impress. starter.js may be adjusted as we evolve this storyboard and learn about its media needs.
- site/video/ - Draft version(s) of composed video.

## Versions

**0.0.1** - Basic skeleton of video site, including index page, storyboard, some audio, and some raw source material.
**0.0.2** - Build a more coherent presentation oriented towards a 3-minute video and an elevator-style presentation. Enhance the pages.html so that there is an index and a button back to the index added to each card.



