#LHNT

this repo will be used to store the code for the LHNT website.

## How to create SSH key (for Windows)

1. download and install Git for Windows: https://git-scm.com/download/win
2. open Git Bash by searching for it in the start menu
3. type `ssh-keygen -t ed25519 -C "YourEmail@Utexas.edu"` and press enter
4. press enter to save the key in the default location 
5. enter a passphrase (this is optional)
6. type `eval $(ssh-agent -s)` and press enter
7. type `ssh-add ~/.ssh/id_ed25519` and press enter
8. type `clip < ~/.ssh/id_ed25519.pub` and press enter
9. paste the key into the SSH key field on GitHub

## How to create SSH key (for Mac)

1. open terminal
2. type `ssh-keygen -t ed25519 -C "
3. press enter to save the key in the default location
4. enter a passphrase (this is optional)
5. type `eval "$(ssh-agent -s)"` and press enter
6. type `ssh-add -K ~/.ssh/id_ed25519` and press enter
7. type `pbcopy < ~/.ssh/id_ed25519.pub` and press enter
8. paste the key into the SSH key field on GitHub

## How to clone the repo

1. open terminal
2. click on the green code button on the repo page
3. click on the clipboard icon to copy the SSH link
4. type `git clone 'SSH-link'` and press enter
5. type `cd 'new-directory'` and type the new directory and press enter

## how to change branches for feature development

1. type `git checkout -b 'new-branch-name'` and press enter
2. make changes to necessary files

## How to push changes to the repo

1. make changes to your files in feature branch
2. change to main branch by typing `git checkout main` and press enter
3. type `git pull` and press enter
4. change to feature branch by typing `git checkout 'feature-branch'` and press enter
5. type `git merge main` and press enter
6. type `git push` and press enter

## How to create a pull request

1. go to the repo page on GitHub
2. click on the pull requests tab
3. click on the green new pull request button
4. compare the changes and click on the green create pull request button
5. add a title and description to the pull request
6. click on the green create pull request button






