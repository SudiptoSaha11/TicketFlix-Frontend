
import React from 'react'
import {BrowserRouter as Router,Route,Routes,} from 'react-router-dom'
import Movie from './components/Admin/Movie'
import Movieview from './components/Admin/Movieview'
import Login from './components/Admin/Login';
import Home from './components/Admin/Home';
import Editmovie from './components/Admin/Editmovie';
import Showtime from './components/Admin/Showtime';
import Addshow from './components/Admin/Addshow';
import Screen from './components/Admin/Screen';
import Addscreen from './components/Admin/Addscreen'
import Editscreen from './components/Admin/Editscreen'
import Editshow from './components/Admin/Editshow';
import Userlogin from './components/User/Login/Userlogin';
import Booking from './components/Admin/Booking';
import { Logout } from "./Logout";
import UserHome from './components/User/Home/UserHome';
import Moviedetails from './components/User/Home/Moviedetails';
import Aboutus from './components/User/Home/Aboutus';
import Ticketbooking from './components/User/Home/Ticketbooking';
import PaymentPage from './components/User/Home/PaymentPage';
import MyBooking from './components/User/Home/Mybooking';
import SuccessPage from './components/User/Home/SuccessPage';
import ErrorPage from './components/User/Home/ErrorPage';
import ContactUs from './components/User/Home/ContactUs';
import Trylogin from './components/User/Login/Userlogin';
import Multimedia from './components/User/Home/Multimedia';
import MovieShowtime from './components/User/Home/MovieShowtime';
import ReviewForm from './components/User/Home/ReviewForm';
import Event from './components/User/Home/Event'
import Faq from './components/User/Home/Faq';
import Eventdetails from './components/User/Home/Eventdetails';
import Eventticketbooking from './components/User/Home/Eventticketbooking';
import MoviePage from './components/User/Home/MoviePage';
import AddEvent from './components/Admin/Addevent';
import Eventview from './components/Admin/Eventview';
import Editevent from './components/Admin/Editevent';
import AddEventSchedule from './components/Admin/AddEventSchedule';
import EventScheduleView from './components/Admin/EventScheduleView';
import Dashboard from './components/Admin/Dashboard';

const App=()=> {
return (
  <>
  <Router>
  <Routes>
         <Route path = '/home'
            element = {<Home/>}/>
          <Route path = '/Userlogin'
            element = {<Logout/>}/>
          <Route path = '/login'
            element = {<Login/>}/>
          <Route path = '/movie'
            element = {<Movie/>}/>
          <Route path = '/movieview'
            element = {<Movieview/>}/>
          <Route path = '/editmovie'
            element = {<Editmovie/>}/>
          <Route path = '/screen'
            element = {<Screen />}/>
          <Route path = '/editscreen'
            element = {<Editscreen />}/>
          <Route path = '/addscreen'
            element = {<Addscreen />}/>
          <Route path = '/Addshow'
            element = {<Addshow/>}/>
          <Route path = '/showtime'
            element = {<Showtime/>}/>
          <Route path = '/editshow'
            element = {<Editshow/>}/>
          <Route path='/userlogin' 
            element={<Userlogin />} /> 
          <Route path = '/booking'
            element = {<Booking/>}/>
          <Route path = '/'
            element = {<UserHome/>}/>
          <Route path='/moviedetails/:id'
            element={<Moviedetails />} />
          <Route path = '/Aboutus'
            element = {<Aboutus/>}/>
          <Route path = '/Ticketbooking'
            element = {<Ticketbooking/>}/>
          <Route path = '/PaymentPage'
            element = {<PaymentPage/>}/>
          <Route path = '/mybooking'
            element = {<MyBooking/>}/>
          <Route path = '/success'
            element = {<SuccessPage/>}/>
          <Route path = '/error'
            element = {<ErrorPage/>}/>
           <Route path = '/support'
            element = {<ContactUs/>}/>
           <Route path = '/trylogin'
            element = {<Trylogin/>}/>
            <Route path = '/multimedia'
            element = {<Multimedia/>}/>
            <Route path = '/MovieShowtime'
            element = {<MovieShowtime/>}/>
            <Route path = '/reviewForm'
            element = {<ReviewForm/>}/>
          <Route path = '/event'
            element = {<Event/>}/>
          <Route path = '/faq'
            element = {<Faq/>}/>
          <Route path = '/eventdetails/:id'
            element = {<Eventdetails/>}/>
          <Route path = '/eventticketbooking'
            element = {<Eventticketbooking/>}/>
          <Route path = '/MoviePage'
            element = {<MoviePage/>}/>
          <Route path = '/addevent'
            element = {<AddEvent/>}/>
          <Route path = '/eventview'
            element = {<Eventview/>}/>
          <Route path = '/editevent'
            element = {<Editevent/>}/>
          <Route path = '/addeventschedule'
            element = {<AddEventSchedule/>}/> 
          <Route path = '/eventscheduleview'
            element = {<EventScheduleView/>}/>
          <Route path = '/dashboard'
            element = {<Dashboard/>}/>  
        </Routes>
        </Router>
  </>
  );
}

export default App;
