#!/bin/bash

set -Eeuxo pipefail

echo 'Running development environment setup for Elpis Cloud'

if [[ "$OSTYPE" == "darwin"* ]]; then
  if ! [ -x "$(command -v brew)" ]; then
    echo 'brew not found, installing now' >&2
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  echo 'Installing direnv'
  brew install direnv
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
  if ! [ -x "$(command -v direnv)" ]; then
    echo 'direnv not found, installing now' >&2
    apt-get install -y direnv
  fi
else
  echo 'Only Mac & Debian/Ubuntu Supported' >&2
  exit 2
fi

if [[ "$SHELL" == "*zsh" ]]; then
  # shellcheck disable=SC2016
  echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc.local
elif [[ "$SHELL" == "*bash" ]]; then
  # shellcheck disable=SC2016
  echo 'eval "$(direnv hook bash)"' >> ~/.bashrc
else
  # shellcheck disable=SC2016
  echo 'Your shell is not supported, use zsh or bash (or add `eval "$(direnv hook bash)"` to your config)' >&2
fi

if ! [ -x "$(command -v nix)" ]; then
  echo 'Nix not found, installing now...' >&2
  curl -L https://nixos.org/nix/install | sh
fi

$SHELL

echo 'Setup complete, restart your shell/terminal or change out of and back in to this directory to trigger direnv.'