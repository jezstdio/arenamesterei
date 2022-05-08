import React, { createRef, useEffect, useState } from "react";

function App() {
  const [players, setPlayers] = useState([]);
  const [rounds, setRounds] = useState(0);

  const [showSettings, setShowSettings] = useState(true);
  const [showRounds, setShowRounds] = useState(false);
  const [showRanks, setShowRanks] = useState(false);

  return (
    <div className="App padding-x-24 padding-y-48">
      { showSettings && <Preparation players={players} rounds={rounds} setRounds={setRounds} setPlayers={setPlayers} setShowSettings={setShowSettings} setShowRounds={setShowRounds} /> }
      { showRounds && <TheGame players={players} rounds={rounds} setRounds={setRounds} setPlayers={setPlayers} setShowRounds={setShowRounds} setShowRanks={setShowRanks} /> }
      { showRanks && <Ranks players={players} /> }
    </div>
  );
}

function Preparation(props) {
  const defaultNewPlayer = {
    name: "",
    score: [],
    playedWith: [],
    skipped: false
  }

  const [newPlayer, setNewPlayer] = useState(defaultNewPlayer);
  const [modifiedRounds, setModifiedRounds] = useState(false);

  function findNameInObject() {
    return Object.keys(props.players).some(player => props.players[player].name.trim() === newPlayer.name.trim())
  }

  function shuffleArray(array) {
    return array.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  function calculateRounds() {
    return ((((props.players.length * props.players.length) - (props.players.length)) / 2))
    / ((props.players.length - (props.players.length % 2 === 0 ? 0 : 1)) / 2) || "0"
  }

  useEffect(() => {
    !modifiedRounds && props.setRounds(calculateRounds) }, [props.players]);

  return (
    <React.Fragment>
      <section className="margin-b-48 flex column center--m start--d">
        <span className="block font-size-32 font-weight-bold margin-b-16">Fordulók száma</span>
        <div className="flex column center--m start--d width-100--m">
          <input className="margin-b-8" type="number" value={props.rounds === "0" ? calculateRounds() : props.rounds}
            onChange={e => {
              !modifiedRounds && setModifiedRounds(true);
              props.setRounds(e.target.value);
            }}
          />
          <p className="text-color-gray-48">állítsd 0-ra ha nem akarsz foglalkozni vele</p>
        </div>
      </section>
      <section className="flex column center--m start--d">
        <span className="block font-size-32 font-weight-bold margin-b-16">Játékosok</span>
        <div className="flex--d row start width-100 wrap">
          <div className="margin-b-16 margin-r-16--d margin-t-24--d">
            <button className="secondary-bg margin-t-2--d" disabled={props.players.length < 1 && props.rounds < 1}
              onClick={e => {
                props.setPlayers(shuffleArray(props.players));
                props.setShowSettings(false);
                props.setShowRounds(true);
              }}
            >Kész</button>
          </div>
          <div className="flex row column--d center margin-b-16 margin-r-16--d">
            <span className="block text-color-gray-48 text-center width-48px margin-r-8">{props.players.length + 1}.</span>
            <input placeholder="Új játékos neve" value={newPlayer.name}
              onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })}
              onKeyDown={e => {
                if (e.key === "Enter" && newPlayer.name.trim() && !findNameInObject()) {
                  const tempNewPlayer = { ...newPlayer, name: newPlayer.name.trim() };

                  props.setPlayers([...props.players.filter(player => player.name), tempNewPlayer]);
                  setNewPlayer(defaultNewPlayer);
                }
              }}
            />
          </div>
          { Object.keys(props.players).map((player, index) => <Player players={props.players} setPlayers={props.setPlayers} key={props.players[player].name} position={index + 1} player={props.players[player]} />).reverse() }
        </div>
        <div className="margin-t-32">
          <button className="unsafe"
            onClick={e => props.setPlayers([])}
          >Lista ürítése</button>
        </div>
      </section>
    </React.Fragment>
  )
}

function Player(props) {
  const [player, setPlayer] = useState(props.player);
  const players = props.players;

  return (
    <div className="flex row column--d center margin-b-16 margin-r-16--d">
      <span className="block text-color-gray-48 text-center width-48px margin-r-8">{props.position}</span>
      <input className="filled" value={player.name} 
        onChange={e => {
          setPlayer({ ...player, name: e.target.value });

          players[props.position - 1] = {
            ...players[props.position - 1],
            name: e.target.value
          };

          props.setPlayers(players);
        }}
        onKeyDown={e => { if (e.key === "Enter") { props.setPlayers(players.filter(player => player.name)) } }}
        onBlur={e => { props.setPlayers(players.filter(player => player.name)) }}
      />
    </div>
  )
}

function TheGame(props) {
  const [currentRound, setCurrentRound] = useState(1);
  const [matches, setMatches] = useState([]);

  const loader = React.createRef();
  const loaderStatus = React.createRef();
  const loaderStatusValuePosition = React.createRef();

  function generateRound() {
    const tempMatches = [];
    const tempPlayers = [...props.players];
    const played = [];

    tempPlayers.push(...tempPlayers.splice(0, 1));

    for (let i = 0; i < tempPlayers.length; i++) {
      if (played.indexOf(tempPlayers[i].name) > -1) {
        continue;
      } else {
        played.push(tempPlayers[i].name);
      }

      for (let ii = tempPlayers.length - 1; ii > 0; ii--) {
        if (tempPlayers[i].playedWith.indexOf(tempPlayers[ii].name) > -1 || played.indexOf(tempPlayers[ii].name) > -1) {
          continue;
        } else {
          played.push(tempPlayers[ii].name);
        }

        tempPlayers[i].playedWith[currentRound - 1] = tempPlayers[ii].name;
        tempPlayers[ii].playedWith[currentRound - 1] = tempPlayers[i].name;

        tempMatches.push(
          <div className="btn-group-container inline-flex--d width-100 width-50--8--ld margin-b-16" key={`${tempPlayers[i].name} vs ${tempPlayers[ii].name}`}>
            <ScoringInputs
              players={tempPlayers}
              setPlayers={props.setPlayers}
              position={i}
              currentRound={currentRound}
            />
            <ScoringInputs
              players={tempPlayers}
              setPlayers={props.setPlayers}
              position={ii}
              currentRound={currentRound}
            />
          </div>
        )

        break;
      }
    }

    if (tempMatches.length > 0 && !(props.rounds < currentRound)) {
      const min = Math.min(...tempPlayers.map(player => player.playedWith.length));
      const max = Math.max(...tempPlayers.map(player => player.playedWith.length));
  
      if (min !== max) {
        tempPlayers.forEach(player => player.playedWith.length === min ? player.skipped = true : player.skipped = false)
      }
  
      tempPlayers.forEach((player, i) => {
        if (player.skipped) {
          tempMatches.push(
            <div className="margin-t-40" key={tempPlayers[i].name}>
              <span className="block font-size-24 font-weight-bold margin-b-16">Kimaradt játékos</span>
              <div className="btn-group-container single-element inline-flex--d width-100 width-50--d width-50--8--ld margin-b-16">
                <ScoringInputs
                  players={tempPlayers}
                  setPlayers={props.setPlayers}
                  position={i}
                  currentRound={currentRound}
                />
              </div>
            </div>
          )
        }
      })

      setMatches(tempMatches);
      props.setPlayers(tempPlayers);
    } else {
      props.setShowRounds(false);
      props.setShowRanks(true);
    }
  }

  function setLoaderSize() {
    loaderStatus.current.style.width = `${((document.body.clientWidth / props.rounds) * currentRound) - (document.body.clientWidth - loader.current.clientWidth)}px`;
  }

  function fixLoaderPosition() {
    loaderStatusValuePosition.current.style.right = `-${loaderStatusValuePosition.current.clientWidth / 2}px`;
  }

  useEffect(setLoaderSize, [currentRound]);
  useEffect(generateRound, [currentRound]);

  window.onresize = setLoaderSize;
  window.onresize = fixLoaderPosition;

  return (
    <section>
      <div className="flex--d row center-start">
        <span className="block font-size-32 font-weight-bold margin-b-16 margin-r-24">{currentRound}.&nbsp;forduló</span>
        <div ref={loader} className="loader margin-b-16">
          <div ref={loaderStatus} className="loader-status">
            <div ref={loaderStatusValuePosition} className="absolute flex row center">
              <span className="absolute right-8">{currentRound}</span>
              <span className="absolute left-8 text-color-white loader-max">{props.rounds}</span>
            </div>
          </div>
        </div>
      </div>
      { matches.length > 0 && matches }
      <div className={`flex--d ${props.rounds !== currentRound ? "justify-between" : "justify-end"} row margin-t-40`.trim()}>
        <button className="secondary-bg order-1--d margin-b-16 width-auto--d"
          onClick={e => {
            setMatches([]);
            setCurrentRound(currentRound + 1);
          }}
        >{ `${props.rounds !== currentRound ? "Következő forduló" : "Végeredmény" }` }</button>
        { props.rounds !== currentRound && <button className="unsafe order-0--d margin-b-16 width-auto--d"
          onClick={e => {
            props.setShowRounds(false);
            props.setShowRanks(true);
          }}
        >Verseny leállítása</button>}
      </div>
    </section>
  )
}

function ScoringInputs(props) {
  const tempPlayers = props.players;
  const tempPlayer = props.players[props.position];
  const [score, setScore] = useState("");

  const inputBtn = React.createRef();

  return (
    <label className="flex row btn-group margin-b-8--m width-100">
      <div ref={inputBtn} className="order-1 btn-like">{props.players[props.position].name}</div>
      <input className="order-0" value={score}
        maxLength="2"
        inputMode="numeric"
        placeholder={0}
        onChange={e => {
          setScore(e.target.value);
          tempPlayer.score[props.currentRound - 1] = e.target.value;
          tempPlayers[props.position] = tempPlayer;
          props.setPlayers(tempPlayers);
        }}
        onFocus={e => {
          e.target.select();
          inputBtn.current.classList.add("bg-color-secondary-48");
        }}
        onBlur={e => inputBtn.current.classList.remove("bg-color-secondary-48")}
      />
    </label>
  )
}

function Ranks(props) {
  const tempPlayers = [...props.players].map(player => {
    player.score = player.score.reduce((a, b) => parseInt(a) + parseInt(b), 0);
    return player;
  }).sort((a, b) => a.score === b.score ? b.name < a.name : b.score - a.score);

  return (
    <div className="flex center column">
      <span className="block font-size-32 font-weight-bold margin-b-16">Eredmények</span>
      <section className="text-center">
        { Object.keys(tempPlayers).map((player, i) => <RanksData key={i} player={tempPlayers[player]} />) }
      </section>
    </div>
  )
}

function RanksData(props) {
  return (
    <div className="margin-b-16">
      <span className="block text-color-gray-48">{props.player.score} pont</span>
      <span className="block">{props.player. name}</span>
    </div>
  )
}

export default App;
