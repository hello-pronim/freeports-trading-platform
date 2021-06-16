import React, { useEffect, useState } from "react";
import {  Container,
          Grid,
          OutlinedInput,
          InputAdornment,
          IconButton,
          InputLabel,
          Input,
          TextField,
          FormControl,
          MenuItem,
          Select,
          List,
          ListItem,
          Button,
          Icon,
          Dialog,
          DialogTitle,
          DialogContent,
          DialogActions,
          makeStyles,
} from "@material-ui/core"
import ImageUploader from 'react-images-upload';
import { useHistory } from "react-router";
import { useOrganization } from "../../../../hooks";


const useStyles = makeStyles((theme) => ({
  margin: {
    margin: theme.spacing(1),
  },
  marginL10: {
    marginLeft: 10,
  },
}))
interface additionOrganizerType {
  name: string;
  street1: string;
  street2: string;
  zip: string;
  city: string;
  country: string;
  commission: string;
  clearer: string;
  logofile: string;
}

interface accountType {
  name: string;
  currency: string;
  type: string;
  iban: string;
  publicAddress: string;
  vaultWalletId: string;
}

const AddOrganizer = (): React.ReactElement => {
  const history = useHistory();
  const classes = useStyles();
  const showingIcon = false;
  const showingLogo = true;
  const [organizerData, setOrganizerData] = useState<additionOrganizerType>({
    name: "",
    street1: "",
    street2: "",
    zip: "",
    city: "",
    country: "",
    commission: "",
    clearer: "",
    logofile: "",
  });
  
  const [accounts, setAccounts] = useState([
    {
      name: 'account1',
      iban: 'vs25226632566'
    },
    {
      name: 'account2',
      iban: 'vs25226631235'
    },
    {
      name: 'account3',
      iban: 'vs25226636528'
    },
    {
      name: 'account4',
      iban: 'vs25226648951'
    }
  ])

  const { addOrganization } = useOrganization();

  const onhadlestreet = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    const neworganizerData = { ...organizerData } ;
    neworganizerData.street1 = value;
    setOrganizerData(neworganizerData);
  }

  const onhadlestreettwo = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    const neworganizerData = { ...organizerData } ;
    neworganizerData.street2 = value;
    setOrganizerData(neworganizerData);
  }

  const onhadlezip = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    const neworganizerData = { ...organizerData } ;
    neworganizerData.zip = value;
    setOrganizerData(neworganizerData);
  }

  const onhadlecity = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    const neworganizerData = { ...organizerData } ;
    neworganizerData.city = value;
    setOrganizerData(neworganizerData);
  }

  const onhadlecountry = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    const neworganizerData = { ...organizerData } ;
    neworganizerData.country = value;
    setOrganizerData(neworganizerData);
  }

  const onhadlename = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    const neworganizerData = { ...organizerData } ;
    neworganizerData.name = value;
    setOrganizerData(neworganizerData);
  }

  const onhadlecommission = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    const neworganizerData = { ...organizerData } ;
    neworganizerData.commission = value;
    setOrganizerData(neworganizerData);
  }

  const onhadleclearer = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = event.target;
    const neworganizerData = { ...organizerData } ;
    neworganizerData.clearer = value;
    setOrganizerData(neworganizerData);
  }

  const onPicker = (pic: any) => {
    const reader = new FileReader();
    reader.onload = (e: any)=>{
      const neworganizerData = { ...organizerData } ;
      neworganizerData.logofile = e.target.result;
      setOrganizerData(neworganizerData);
    }
    reader.readAsDataURL(pic[0]);
  }

  const onAdditionfunc = async () => {
    if(organizerData.name === "" || organizerData.commission === "" || organizerData.clearer === "" || organizerData.logofile === ""){
      alert('this is my addition function');
    }else{
      const nowTime = new Date()
      await addOrganization(organizerData.name, organizerData.street1, organizerData.street2, organizerData.zip, organizerData.city, organizerData.country, organizerData.logofile, nowTime.getTime(), organizerData.commission, organizerData.clearer)
        .then((data: any) => {
          const responseId = data.id;
            console.log(responseId)
            history.push('/organisations');
        }).catch((err: any) => {
          console.log(err);
        })
    }
  }
  

  return(
    <div className="main-wrapper">
      <Container>
        <Grid container item spacing={1} xs={6}>
          <Grid item xs={12}>
            <h2>CREAETE NEW ORGANISATION</h2>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth className={classes.margin} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-amount">Orgainisation name</InputLabel>
              <OutlinedInput
                id="outlined-adornment-amount"
                labelWidth={150}
                onChange={onhadlename}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth className={classes.margin} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-amount">Street 1</InputLabel>
              <OutlinedInput
                id="outlined-adornment-amount"
                labelWidth={60}
                onChange={onhadlestreet}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth className={classes.margin} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-amount">Street 2</InputLabel>
              <OutlinedInput
                id="outlined-adornment-amount"
                labelWidth={60}
                onChange={onhadlestreettwo}
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth className={classes.margin} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-amount">zip</InputLabel>
              <OutlinedInput
                id="outlined-adornment-amount"
                labelWidth={40}
                onChange={onhadlezip}
              />
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth className={classes.margin} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-amount">City</InputLabel>
              <OutlinedInput
                id="outlined-adornment-amount"
                labelWidth={40}
                onChange={onhadlecity}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth className={classes.margin} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-amount">Country</InputLabel>
              <OutlinedInput
                id="outlined-adornment-amount"
                labelWidth={60}
                onChange={onhadlecountry}
              />
            </FormControl>
          </Grid>
          <Grid item xs={12}>

            <span style={{ fontWeight: "bold" }}>Nostro Accounts</span>
            
            <FormControl fullWidth>
              <Select>
                <MenuItem>Then</MenuItem>
                <MenuItem>Then</MenuItem>
                <MenuItem>Then</MenuItem>
                <MenuItem>Then</MenuItem>
              </Select>
            </FormControl>
            {/* <List>
              {additionAccounts.map((accountItem) => <ListItem>
                  <Icon color="error" >remove_circle</Icon>
                  <span style={{marginLeft: 10,}}>IBAN: </span>
                  <span style={{fontWeight: "bold", marginLeft: 25}}>{accountItem.iban}</span>
              </ListItem>)}
            </List> */}
          </Grid>
          <Grid item xs={12} style={{padding: 10}}>
            <span style={{fontWeight: "bold"}}>Add Organisation logo</span>
            <FormControl fullWidth style={{marginTop: 5}}>
              <ImageUploader
                withIcon={showingIcon}
                withLabel={showingIcon}
                buttonText='Choose Image'
                onChange={(ChangeEvent) => onPicker(ChangeEvent)}
                buttonStyles={{
                  width: "100%",
                  padding: 10,
                  fontSize: 20,
                }}
                fileContainerStyle={{
                  margin: 0,
                  padding: 0,
                }}
                withPreview={showingLogo}
                singleImage={showingLogo}
              />
            </FormControl>
          </Grid>
          <Grid item container direction="row" justify="flex-start" spacing={3} xs={12} style={{padding: 10}}>
            <Grid item xs={6}>
              <FormControl fullWidth className={classes.margin} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-amount">Set commission rate</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-amount"
                  labelWidth={250}
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  onChange={onhadlecommission}
                />
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth className={classes.margin} variant="outlined">
                <InputLabel htmlFor="outlined-adornment-amount">Set clearer commission rate</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-amount"
                  labelWidth={250}
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  onChange={onhadleclearer}
                />
              </FormControl>
              {/* <FormControl fullWidth style={{marginTop: 5}}>
                <span style={{fontWeight: "bold"}}>Set clearer commission rate</span>
                <Input 
                  endAdornment={<InputAdornment position="end">%</InputAdornment>}
                  onChange={onhadleclearer}
                />
              </FormControl> */}
            </Grid>
          </Grid>
          <Grid item container justify="flex-end" xs={12} style={{padding: 10}}>
            <Button 
              variant="contained"
              color="secondary"
              onClick={onAdditionfunc}
            >
              SAVE NEW ORGANISATION
            </Button>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default AddOrganizer;