import './App.css'
import { Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import { MainPage } from './components/MainPage'
import Footer from './components/Footer'
import Stage1 from './components/Stages/Stage1'
import BGM from './components/BGM'
import Stage2 from './components/Stages/Stage2'
import Stage3 from './components/Stages/Stage3'
import Stage4 from './components/Stages/Stage4'
import AllClear from './components/AllClear'


function App() {

  return (
    <>
      <Header />
      <BGM />
      <Routes>
        <Route path='/' element={<MainPage />} />
        <Route path='/stage/1' element={<Stage1 />} />
        <Route path='/stage/2' element={<Stage2 />} />
        <Route path='/stage/3' element={<Stage3 />} />
        <Route path='/stage/4' element={<Stage4 />} />
        {/* <Route path='/stage/5' element={<Stage5 />} />  */}
        <Route path='/AllClear' element={<AllClear/>}></Route>
      </Routes>

      <Footer isClear={false} />

    </>
  )
}

export default App
