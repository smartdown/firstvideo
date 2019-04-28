#
# Based upon:
#	https://blog.bloomca.me/2017/12/15/how-to-push-folder-to-github-pages.html
#

REMOTE=`git remote get-url --push origin`
rm -rf dist
mkdir dist
cp -r site/ dist/
touch dist/.nojekyll
cd dist
git init
git add .
git commit -m "Initial commit"
git remote add origin ${REMOTE}
git push --force origin master:gh-pages
