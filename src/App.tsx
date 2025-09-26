import { SongData } from '@taiko-wiki/taikowiki-api/types'
import './App.css'
import { Await } from './components/Await'
import { createEffect, createMemo, createSignal, For, Setter, Show } from 'solid-js'
import TaikowikiApi from '@taiko-wiki/taikowiki-api'
import { Radio } from './components/Radio'
import { difficultyIcon } from './assets/difficulty/difficultyIcon'
import { difficultyColor, genreColor } from './util'

function App() {
  const wiki = createMemo(() => new TaikowikiApi());
  let [songDatasPromise, setSongDatasPromise] = createSignal(getSongDatas(wiki()));

  function reload() {
    setSongDatasPromise(getSongDatas(wiki(), true));
  }

  return (
    <Show when={songDatasPromise()} keyed>
      <Await
        for={songDatasPromise()}
        pending={<>로딩중...</>}
        then={(songDatas) => <>
          <RandomSongSelector songDatas={songDatas} />
          <button on:click={reload} style="margin-top: 10px;">곡 리스트 새로고침</button>
        </>}
        catch={(err) => {
          console.error(err);
          return <>오류 발생</>
        }}
      />
    </Show>
  )
}

function RandomSongSelector({ songDatas }: { songDatas: SongDatas }) {
  const [randomOption, setRandomOption] = createSignal<RandomOption>({
    difficulty: 'oniura',
    level: {
      from: 10,
      to: 10
    }
  });

  const [picked, setPicked] = createSignal<Picked | null>(null);

  function pick() {
    const randOpt = randomOption();
    const difficulty = randOpt.difficulty === "oniura" ? (['oni', 'ura'] as const)[Math.floor(Math.random() * 2)] : randOpt.difficulty;
    const candidates = new Set<SongData>();
    for (let level = randOpt.level.from; level <= randOpt.level.to; level++) {
      songDatas.byDiffLevel.get(difficulty)?.get(level)?.forEach((songData) => {
        candidates.add(songData);
      })
    };

    const candidatesArr = Array.from(candidates);
    const song = candidatesArr[Math.floor(Math.random() * candidatesArr.length)];
    setPicked(() => ({
      song,
      difficulty: difficulty,
      level: song.courses[difficulty]?.level ?? 0
    }));
  }

  const containerStyle = {
    display: 'flex',
    'flex-direction': 'column',
    'justify-content': 'center',
    'align-items': 'center',
    'row-gap': '10px'
  } as const;

  const pickButtonStyle = {
    width: '100px',
    height: '30px'
  }

  return <>
    <div style={containerStyle}>
      <RandomOptionSelector
        randomOption={randomOption()}
        setRandomOption={setRandomOption}
      />
      <button style={pickButtonStyle} on:click={pick}>뽑기</button>
      <Show when={picked()} keyed>
        {(picked) => <SongView song={picked.song} difficulty={picked.difficulty} level={picked.level} />}
      </Show>
    </div>
  </>
}

function RandomOptionSelector({ randomOption, setRandomOption }: { randomOption: RandomOption, setRandomOption: Setter<RandomOption> }) {
  const [difficulty, setDifficulty] = createSignal(randomOption.difficulty);
  const [from, setFrom] = createSignal(randomOption.level.from);
  const [to, setTo] = createSignal(randomOption.level.to);
  createEffect(() => {
    switch (difficulty()) {
      case "easy": {
        if (from() > 5) setFrom(() => 5);
        if (to() > 5) setTo(() => 5);
        break;
      }
      case "normal": {
        if (from() > 7) setFrom(() => 7);
        if (to() > 7) setTo(() => 7);
        break;
      }
      case "hard": {
        if (from() > 8) setFrom(() => 8);
        if (to() > 8) setTo(() => 8);
        break;
      }
    }
    if (to() < from()) {
      setTo(() => from());
    }
    setRandomOption(() => ({ difficulty: difficulty(), level: { from: from(), to: to() } }))
  })

  const containerStyle = {
    display: 'flex',
    'flex-direction': 'column',
    'justify-content': 'center',
    'align-items': 'center',
    'row-gap': '10px'
  } as const;
  const radioGroupStyle = {
    display: 'flex',
    'flex-wrap': 'wrap',
    'justify-content': 'center',
    'align-items': 'center'
  } as const;
  const selectGroupStyle = {
    display: 'flex',
    'justify-content': 'center',
    'align-items': 'center',
    'column-gap': '3px'
  };
  const labelStyle = {
    display: 'flex',
    alignItems: 'center'
  };
  const iconStyle = {
    width: '60px',
  };
  const selectStyle = {
    width: '70px',
    height: '35px',
    'text-align': 'center',
    'font-size': '18px',
    'background-color': 'black',
    color: 'white',
    'outline': '0',
    border: '1px solid #414141',
    'border-radius': '5px'
  } as const;

  return <>
    <div style={containerStyle}>
      <div style={radioGroupStyle}>
        <For each={['easy', 'normal', 'hard', 'oni', 'ura', 'oniura'] as const}>
          {(diff) => <>
            <label style={labelStyle}>
              <Radio signal={[difficulty, setDifficulty]} value={diff} id={diff} />
              <img style={iconStyle} src={difficultyIcon[diff]} alt={diff} />
            </label>
          </>}
        </For>
      </div>
      <div style={selectGroupStyle}>
        <select value={from()} style={selectStyle} on:change={(e) => setFrom(() => Number(e.currentTarget.value))}>
          <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}>
            {(level) => <option value={level}>★ {level}</option>}
          </For>
        </select>
        <div style="font-size: 18px;">~</div>
        <select value={to()} style={selectStyle} on:change={(e) => setTo(() => Number(e.currentTarget.value))}>
          <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}>
            {(level) => <option value={level}>★ {level}</option>}
          </For>
        </select>
      </div>
    </div>
  </>
}

function SongView({ song, difficulty, level }: Picked) {
  const containerStyle = {
    width: '300px',
    height: '60px',
    background: `linear-gradient(90deg, ${song.genre.map((genre, i, a) => `${genreColor[genre]} calc( 100% * ${i} / ${a.length}), ${genreColor[genre]} calc( 100% * ${i + 1} / ${a.length} )`).join(', ')})`,
    display: 'flex',
    'justify-content': 'center',
    'align-items': 'center',
    'border-radius': '10px',
    'column-gap': '10px',
    'box-sizing': 'border-box',
    'padding-inline': '5px',
    color: 'inherit',
    'text-decoration': 'none'
  } as const;
  const levelStyle = {
    width: '60px',
    height: '30px',
    background: difficultyColor[difficulty],
    display: 'flex',
    'justify-content': 'center',
    'align-items': 'center',
    'box-sizing': 'border-box',
    'padding-bottom': '1px',
    'font-weight': 'bold',
    'border-radius': '5px'
  } as const;
  const titleStyle = {
    'font-weight': 'bold',
    'font-size': '20px',
    'transform': 'translateY(-1px)',
    'text-wrap': 'balance',
    'flex': '1 1'
  } as const;

  return (
    <a style={containerStyle} href={`//taiko.wiki/song/${song.songNo}`}>
      <div style={levelStyle}>
        <div>
          ★ {level}
        </div>
      </div>
      <div style={titleStyle}>
        {song.title}
      </div>
    </a>
  )
}

/**
 * 곡 데이터 가져오기
 * @param wiki 
 * @param force 
 * @returns 
 */
async function getSongDatas(wiki: TaikowikiApi, force?: true) {
  const songDataArray = await fetchSongDataArray(wiki, force);

  const byDiffLevel = new Map<Omit<Difficulty, 'oniura'>, Map<number, SongData[]>>();
  for (let diff of ['easy', 'normal', 'hard', 'oni', 'ura'] as Difficulty[]) {
    const levelMap = new Map();
    for (let level = 1; level <= 10; level++) {
      levelMap.set(level, []);
    }
    byDiffLevel.set(diff, levelMap);
  }

  for (const songData of songDataArray) {
    if(!songData.version.includes("NAC") || songData.isDeleted) continue;
    for (let diff of ['easy', 'normal', 'hard', 'oni', 'ura'] as const) {
      // byDiffLevel
      if (songData.courses[diff]) {
        byDiffLevel.get(diff)?.get(songData.courses[diff].level)?.push(songData);
      }
    }
  }

  return {
    byDiffLevel
  }
}

async function fetchSongDataArray(wiki: TaikowikiApi, force?: true): Promise<SongData[]> {
  const songDaraArrayJson = window.localStorage.getItem('songDaraArray');
  try {
    if (songDaraArrayJson && !force) {
      return JSON.parse(songDaraArrayJson);
    }
  } catch { }
  const songDaraArray = await wiki.songAll();
  window.localStorage.setItem('songDaraArray', JSON.stringify(songDaraArray));
  return songDaraArray;
}

export default App

type Difficulty = keyof SongData['courses'];
type SongDatas = Awaited<ReturnType<typeof getSongDatas>>;
type RandomOption = {
  difficulty: Difficulty | 'oniura',
  level: {
    from: number,
    to: number
  }
};
type Picked = {
  song: SongData,
  difficulty: Difficulty,
  level: number
}