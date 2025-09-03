import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { getTodaysClassicArt, getTodaysMuralArt, getTodaysSculptureArt } from './util/DailyArt';

function App() {

	const [classicArt, setClassicArt] = useState();
	const [muralArt, setMuralArt] = useState();
	const [sculptureArt, setSculptureArt] = useState();

	useEffect(() => {
		getTodaysClassicArt().then(setClassicArt);
		getTodaysMuralArt().then(setMuralArt);
		getTodaysSculptureArt().then(setSculptureArt);
	}, [])

	return (
		<div className="App">
			{classicArt != null &&	
				<div>
					Obra sorteada para o modo clássico: {classicArt.metadata['numero-de-registro'].value}
				</div>
			}
			{muralArt != null &&
				<div>
					Obra sorteada para o modo mural: {muralArt.metadata['numero-de-registro'].value}
				</div>
			}
			{sculptureArt != null &&
				<div>
					Obra sorteada para o modo escultura: {sculptureArt.metadata['numero-de-registro'].value}
				</div>
			}
		</div>
	);
}

export default App;
