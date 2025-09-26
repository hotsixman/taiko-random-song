import { SongData, SongSearchData } from '@taiko-wiki/taikowiki-api/types'
import './App.css'
import { Await } from './components/Await'
import { Accessor, createMemo, createSignal, Setter, Show } from 'solid-js'
import TaikowikiApi from '@taiko-wiki/taikowiki-api'

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
          <button on:click={reload}>곡 리스트 새로고침</button>
        </>}
        catch={(err) => {
          console.log(err);
          return <>오류 발생</>
        }}
      />
    </Show>
  )
}

function RandomSongSelector({ songDatas }: { songDatas: SongData[] }) {
  const [randomOption, setRandomOption] = createSignal<RandomOption>({
    difficulty: 'oniura',
    level: {
      from: 1,
      to: 10
    }
  });

  return <>
    <RandomOptionSelector
      randomOption={randomOption()}
      setRandomOption={setRandomOption}
    />
  </>
}

function RandomOptionSelector({ randomOption, setRandomOption }: { randomOption: RandomOption, setRandomOption: Setter<RandomOption> }) {
  return <>
    <div class="random-option-selector">

    </div>
  </>
}

async function getSongDatas(wiki: TaikowikiApi, force?: true): Promise<SongData[]> {
  const songDatasJson = window.localStorage.getItem('songDatas');
  if (songDatasJson && !force) {
    return JSON.parse(songDatasJson);
  }
  else {
    const songDatas = await wiki.songAll();
    window.localStorage.setItem('songDatas', JSON.stringify(songDatas));
    return songDatas;
  }
}

export default App

type Difficulty = keyof SongData['courses']
type RandomOption = {
  difficulty?: (Difficulty & 'oniura'),
  level: {
    from: number,
    to: number
  }
}