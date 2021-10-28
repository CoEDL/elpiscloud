{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
    nativeBuildInputs = [
        pkgs.bazel
        pkgs.docker
        pkgs.gzip
        pkgs.nodejs
        pkgs.python39
        pkgs.xz
        pkgs.yarn
        pkgs.zsh
    ];
    shellHook = ''
         SHELL=zsh
    '';
}
