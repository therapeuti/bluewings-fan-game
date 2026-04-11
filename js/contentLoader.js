import sentenceSource from '../sentence-list.md?raw';
import wordSource from '../word-list.md?raw';
import songSource from '../song-list.md?raw';

function parseMarkdownLines(source) {
  return source
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^-\s*/, ''))
    .filter(Boolean);
}

function parseSongs(source) {
  const songs = [];
  let currentSong = null;

  source.split('\n').forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      return;
    }

    if (line.startsWith('#')) {
      if (currentSong && currentSong.lines.length) {
        songs.push(currentSong);
      }

      currentSong = {
        title: line.replace(/^#+\s*/, '').trim(),
        lines: [],
      };
      return;
    }

    if (!currentSong) {
      return;
    }

    currentSong.lines.push(line);
  });

  if (currentSong && currentSong.lines.length) {
    songs.push(currentSong);
  }

  return songs.map((song) => ({
    ...song,
    entries: [
      { text: song.title, type: 'title' },
      ...song.lines.map((text) => ({ text, type: 'lyric' })),
    ],
  }));
}

export function loadPracticeContent() {
  const words = parseMarkdownLines(wordSource);
  const sentences = parseMarkdownLines(sentenceSource);
  const songs = parseSongs(songSource);

  return {
    words,
    sentences,
    songs,
  };
}
