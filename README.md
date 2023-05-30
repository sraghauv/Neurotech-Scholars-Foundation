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
4. type `git clone ` and paste the link. Press enter
5. type `cd ` and type the new directory and press enter

## How to push changes to the repo

1. change to branch you want to push
2. type `git add .` and press enter
3. type `git commit -m "message"` and press enter
4. type `git push origin 'name-of-branch'` and press enter


