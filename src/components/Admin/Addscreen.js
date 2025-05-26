import React, { useState } from "react";
import axios from "axios";
import '../Admin/Addscreen.css'
const Addscreen =() =>{
    const [ScreenNumber, SetScreenNumber] = useState('');
    const [MovieName, SetMovieName] = useState('');
    const [GoldSeat, SetGoldSeat] = useState('');
    const [SilverSeat, SetSilverSeat] = useState('');
    const [PlatinumSeat, SetPlatinumSeat] = useState('');


    const addRowHandler= async (evet)=>{
      evet.preventDefault();
      console.log(ScreenNumber);
      console.log(MovieName);
      console.log(GoldSeat);
      console.log(SilverSeat);
      console.log(PlatinumSeat);
      
      try{
        const response = await axios.post('http://localhost:5000/screen/add',
        {
            ScreenNumber,
            MovieName,
            GoldSeat,
            SilverSeat,
            PlatinumSeat
        }
  );
    
      //Const responseData = await response.jason();
      console.log(response);
      }
      catch (err){
        console.log("error");
        console.log ("data");
      }
      SetScreenNumber('');
      SetMovieName('');
      SetGoldSeat('');
      SetSilverSeat('');
      SetPlatinumSeat('');

}

const textScreenNumberChangeHandler=(evet)=>{
    SetScreenNumber(evet.target.value);
};
const textMovieNameChangeHandler=(evet)=>{
    SetMovieName(evet.target.value);
};
const textGoldSeatChangeHandler = (evet)=>{
    SetGoldSeat(evet.target.value);
};
const textSilverSeatChangeHandler = (evet)=>{
    SetSilverSeat(evet.target.value);
};
const textPlatinumSeatChangeHandler = (evet)=>{
    SetPlatinumSeat(evet.target.value);
};

return (
  <body className="Screen_body">
<form className="form_class_screen" style ={{ margin: "5rem" }} onSubmit={addRowHandler}>
  <div class="mb-5">
  <label className="Label_Screen">Enter Screen Number</label>
  <input type="text" class="form-control_Screen" id="formGroupExampleInput" placeholder="Enter Screen Number"
  value={ScreenNumber} onChange={textScreenNumberChangeHandler} required /><br></br>
</div>
<div class="mb-5">
  <label className="Label_Screen">Enter Movie Number</label>
  <input type="text" class="form-control_Screen" id="formGroupExampleInput2" placeholder="Enter Movie Name"
  value={MovieName} onChange={textMovieNameChangeHandler} required /><br></br>
  
</div>
<div class="mb-5">
  <label className="Label_Screen">Enter Gold Seat</label>
  <input type="text" class="form-control_Screen" id="formGroupExampleInput2" placeholder="Enter Gold Seat"
  value={GoldSeat} onChange={textGoldSeatChangeHandler} required /><br></br>
</div>
<div class="mb-5">
  <label className="Label_Screen">Enter Silver Seat </label>
  <input type="text" class="form-control_Screen" id="formGroupExampleInput2" placeholder="Enter Silver Seat"
  value={SilverSeat} onChange={textSilverSeatChangeHandler} required /><br></br>
</div>
<div class="mb-5">
  <label className="Label_Screen">Enter Platinum Seat </label>
  <input type="text" class="form-control_Screen" id="formGroupExampleInput2" placeholder="Enter Platinum Seat"
  value={PlatinumSeat} onChange={textPlatinumSeatChangeHandler} required /><br></br>
  <div className="submit-3">
  <button class="Button_Screen" type="submit">Submit</button>
  </div>
</div>
</form>
</body>
);
};
export default Addscreen;