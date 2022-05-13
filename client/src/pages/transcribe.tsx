import React from 'react';

export default function Transcribe() {
  return (
    <>
      <h2 className="title">Transcribe</h2>
      <p className="text-lg">
        Elpis is a tool which allows language workers with minimal computational
        experience to build their own speech recognition models to automatically
        transcribe audio. It relies on the Kaldi automatic speech recognition
        (ASR) toolkit. Kaldi is notorious for being difficult to build, use and
        navigate - even for trained computer scientists. The goal of Elpis is to
        expose the power of Kaldi to linguists and language workers by
        abstracting away much of the needless technical complexity.
      </p>
    </>
  );
}
