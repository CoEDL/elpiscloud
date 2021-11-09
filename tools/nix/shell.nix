{ pkgs ? import <nixpkgs> {} }:
pkgs.mkShell {
    nativeBuildInputs = [
        pkgs.bazel_4
        pkgs.docker
        pkgs.gcc
        pkgs.gzip
        pkgs.jdk8
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
