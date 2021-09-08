import React, { useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Navbar from '../components/Navbar';
import Paper from '@material-ui/core/Paper';
import Copyright from '../components/Copyright';
import Button from '@material-ui/core/Button';
import ButtonBase from '@material-ui/core/ButtonBase';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import fileToDataUrl from '../components/helper';
import MenuItem from '@material-ui/core/MenuItem';
import InputBase from '@material-ui/core/InputBase';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import { useHistory, useParams } from 'react-router-dom';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const BootstrapInput = withStyles((theme) => ({
  root: {
    'label + &': {
      marginTop: theme.spacing(3),
    },
  },
  input: {
    borderRadius: 4,
    position: 'relative',
    backgroundColor: theme.palette.background.paper,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 26px 10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    '&:focus': {
      borderRadius: 4,
      borderColor: '#80bdff',
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
    },
  },
}))(InputBase);

const useStyles = makeStyles((theme) => ({
  root: {
        '& .MuiTextField-root': {
          margin: theme.spacing(2),
          width: 300,
        },
    },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    [theme.breakpoints.up(800 + theme.spacing(2) * 2)]: {
      width: 800,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },
  paper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    [theme.breakpoints.up(800 + theme.spacing(3) * 2)]: {
      marginTop: theme.spacing(6),
      marginBottom: theme.spacing(6),
      padding: theme.spacing(3),
    },
  },
  img_input: {
    display: 'none'
  },
  button: {
    marginTop: theme.spacing(3),
    marginLeft: theme.spacing(1),
  },
  large: {
    width: theme.spacing(12),
    height: theme.spacing(12),
  },
  image: {
    position: 'relative',
    height: 200,
    [theme.breakpoints.down('xs')]: {
      width: '100% !important', // Overrides inline-style
      height: 100,
    },
    '&:hover, &$focusVisible': {
      zIndex: 1,
      '& $imageBackdrop': {
        opacity: 0.15,
      },
      '& $imageMarked': {
        opacity: 0,
      },
      '& $imageTitle': {
        border: '4px solid currentColor',
      },
    },
  },
  focusVisible: {},
  imageButton: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.common.white,
  },
  imageSrc: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center 40%',
  },
  imageBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0.4,
    transition: theme.transitions.create('opacity'),
  },
  imageTitle: {
    position: 'relative',
    padding: `${theme.spacing(2)}px ${theme.spacing(4)}px ${theme.spacing(1) + 6}px`,
  },
  imageMarked: {
    height: 3,
    width: 18,
    backgroundColor: theme.palette.common.white,
    position: 'absolute',
    bottom: -2,
    left: 'calc(50% - 9px)',
    transition: theme.transitions.create('opacity'),
  },
}));

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  let rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function EditRecipe () {
  const classes = useStyles();
  const sessionToken = sessionStorage.getItem('token');
  const [alertMsg, setAlertMsg] = React.useState('');
  const [severity, setSeverity] = React.useState('info');
  const [open, setOpen] = React.useState(false);
  const [igdKeys, setIgdKeys] = React.useState([1,2,3]);
  const [methodKeys, setMethodKeys] = React.useState([1,2,3]);
  const imgUploadRef = React.useRef();
  const [mealtype, setMealType] = React.useState('');
  const [src, setSrc] = React.useState('');
  const [name, setName] = React.useState('');
  const [igdList, setIgdList] = React.useState([]);
  const [mtdList, setMtdList] = React.useState([]);
  const [pptList, setPptList] = React.useState([]);
  const history = useHistory();
  const rid = useParams().rid;

  // handle alert message box close or not
  const handleClose = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }

  // handle mealtype attribute changing
  const handleChangeMealtype = (newMealtype) => {
    setMealType(newMealtype);
  }

  // handle list changing when user type in ingredients, method, or proportion
  const handleLstChange = (v, idx, type) => {
    v = v.replace(/,/g, " ");
    if(type==='igd'){
      const newLst = [...igdList];
      newLst[idx] = v;
      setIgdList(newLst);
    } else if(type==='mtd'){
      const newLst = [...mtdList];
      newLst[idx] = v;
      setMtdList(newLst);
    } else {
      const newLst = [...pptList];
      newLst[idx] = v;
      setPptList(newLst);
    }
  }

  // handle IMG uploading and transfer it to base64 format
  const handleUploadImg = (img) => {
    // console.log(img);
    if(['image/jpeg', 'image/png', 'image/jpg'].includes(img.type)){
      fileToDataUrl(img).then(data => {
        // console.log(data);
        setSrc(data.split(',')[1]);
      })
    } else {
      setOpen(true);
      setSeverity('error');
      setAlertMsg('Image type is not valid, must be jpeg/png/jpg');
    }
  }

  // handle list changing when user wants to add one more line of ingredients, proportion or method
  const handleAdd = (type) => {
    // console.log(Math.max.apply(Math, igdKeys));
    if(type === 'igd') {
      const newIgdKeys = [...igdKeys];
      newIgdKeys[igdKeys.length] = Math.max.apply(Math, igdKeys) + 1;
      setIgdKeys(newIgdKeys);
    } else {
      const newMtdKeys = [...methodKeys];
      newMtdKeys[methodKeys.length] = Math.max.apply(Math, methodKeys) + 1;
      setMethodKeys(newMtdKeys);
    }
    
  }

  // handle list changing when user wants to delete one line of ingredients, proportion or method
  const handleDelete = (el, type) => {
    if(el===1){
      setOpen(true);
      setSeverity('error');
      setAlertMsg('You have to maintain at least one element!');
      return;
    }
    if(type === 'igd') {
      const newIgdKeys = [...igdKeys];
      newIgdKeys.remove(el-1);
      setIgdKeys(newIgdKeys);
      const newigdLst = [...igdList];
      const newpptLst = [...pptList];
      newigdLst.remove(el-1);
      newpptLst.remove(el-1);
      setIgdList(newigdLst);
      setPptList(newpptLst);
    } else {
      const newMtdKeys = [...methodKeys];
      newMtdKeys.remove(el-1);
      setMethodKeys(newMtdKeys);
      const newLst = [...mtdList];
      newLst.remove(el-1);
      setMtdList(newLst);
    }
  }

  // chech if all required information have been entered
  const checkValid = (v, type) => {
    // console.log(v);
    if(v===undefined || v.length===0){
      setOpen(true);
      setSeverity('error');
      setAlertMsg(`${type} cannot be blank!`);
      return false;
    } 
    return true;
  }

  // chech if all required list information have been entered (ingredients, method, proportion)
  const processLst = (lst, type) => {
    // console.log(lst.includes(undefined));
    if (lst.includes(undefined) || lst.length===0){
      setOpen(true);
      setSeverity('error');
      setAlertMsg(`${type} cannot be blank!`);
      return false;
    }
    return true;
  }

  const handleSubmit = () => {
    const igds = processLst(igdList, 'ingredients');
    const ppts = processLst(pptList, 'proportion');
    const methods = processLst(mtdList, 'Method');

    // if all valid then able to fetch api and alter the record
    if(checkValid(name) && igds && ppts && methods && checkValid(src, 'src') && checkValid(mealtype, 'mealtype') ){
      const recipeBody = {
        "name": name,
        "ingredients": igdList,
        "method": mtdList,
        "proportion": pptList,
        "src": src,
        "meal_type": mealtype
      };

      const url = 'http://localhost:5000/recipe/?id=' + rid;
      fetch(url, {
        method: 'PATCH',
        body: JSON.stringify(recipeBody),
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'T ' + sessionToken
        }
      }).then(rs => {
        if (rs.status === 200) {
          console.log()
          setOpen(true);
          setSeverity('success');
          setAlertMsg('We have edit your recipe!');
          history.push('../profile');
        } else {
          rs.json().then(result => {
            console.log(result.message);
            setOpen(true);
            setSeverity('error');
            setAlertMsg(result.message);
          })
        }
      })
    }
  }

  // fetch the recipe needed to be changed so the user can be easily modify the part he wants
  const getInfo = () => {
    // console.log(rid);
    const url = 'http://localhost:5000/recipe/?id=' + rid;
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'T ' + sessionToken
        }
      }).then(rs => {
        if (rs.status === 200) {
          rs.json().then(result => {
            console.log(result);
            setSrc(result.src);
            setName(result.name);
            if(result.ingredients.length > 3){
              const newIgdKeys = new Array();
              for(let i=0; i<result.ingredients.length; i++){
                newIgdKeys.push(i+1);
              }
              setIgdKeys(newIgdKeys);
            }
            setIgdList(result.ingredients);
            setPptList(result.proportion);
            if(result.method.length > 3){
              const newMtdKeys = new Array();
              for(let i=0; i<result.method.length; i++){
                newMtdKeys.push(i+1);
              }
              setMethodKeys(newMtdKeys);
            }
            setMtdList(result.method);
            setMealType(result.meal_type);
          })
        } else {
          rs.json().then(result => {
            console.log(result.message);
            setOpen(true);
            setSeverity('error');
            setAlertMsg(result.message);
          })
        }
      })
  }

  // fetch all info once the page loads
  useEffect(() => {
    getInfo();
  }, []);


  return (
    <React.Fragment>
      <CssBaseline />
      <Navbar />
      <main className={classes.layout}>
        <Paper className={classes.paper}>
          <Typography component="h1" variant="h4" align="center" color="primary">
            Edit Recipe
          </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
          <Typography variant="subtitle1">Recipe Image</Typography>
            <input accept="image/*"  onChange={(event) => {handleUploadImg(event.target.files[0])} } ref={imgUploadRef} id="icon-button-file" type="file" className={classes.img_input}/>
            <ButtonBase
                focusRipple
                className={classes.image}
                focusVisibleClassName={classes.focusVisible}
                style={{
                    width: '240px'
                }}
                onClick={()=>{imgUploadRef.current.click()}}
                >
                <span
                    className={classes.imageSrc}
                    style={{
                    backgroundImage: `url(data:image/jpeg;base64,${src})`,
                    }}
                />
                <span className={classes.imageBackdrop} />
                <span className={classes.imageButton}>
                    <Typography
                    component="span"
                    variant="subtitle1"
                    color="inherit"
                    className={classes.imageTitle}
                    >
                    Choose image
                    <span className={classes.imageMarked} />
                    </Typography>
                </span>
            </ButtonBase>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1">Recipe name</Typography>
            <TextField
              multiline
              fullWidth
              variant="outlined"
              autoComplete="Recipe name"
              placeholder={name}
              onChange={(event)=> {setName(event.target.value)}}
            />
          </Grid>
          {/* add recipe ingredients and proportion dom */}
          <Grid item xs={12} sm={12}>
            <Typography variant="subtitle1">Ingredients and Proportions</Typography>
            {igdKeys.map((igd) => (
              <div key={igd} className={classes.root}>
                <TextField
                multiline
                variant="outlined"
                autoComplete="Recipe ingredients"
                placeholder={(igdList.length)>=igd ? igdList[igd-1] : `add ingredients${igd}`}
                onChange={(event)=>{handleLstChange(event.target.value, igd-1, 'igd')}}
                />
                <TextField
                multiline
                variant="outlined"
                autoComplete="Ingredients Proportion"
                placeholder={(pptList.length)>=igd ? pptList[igd-1] : `add ingredients${igd}`}
                onChange={(event)=>{handleLstChange(event.target.value, igd-1, 'ppt')}}
                />
                <IconButton aria-label="delete" color="primary" onClick={() => {handleDelete(igd, 'igd')}}>
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <Button variant="outlined" onClick={() => {handleAdd('igd')}} size="small">+</Button>
          </Grid>

          {/* add recipe method dom */}
          <Grid item xs={12} sm={8}>
            <Typography variant="subtitle1">Add Method</Typography>
            {methodKeys.map((mtd) => (
              <div key={mtd} className={classes.root}>
                <TextField
                multiline
                variant="outlined"
                autoComplete="Recipe method"
                placeholder={(mtdList.length)>=mtd ? mtdList[mtd-1] : `add method${mtd}`}
                onChange={(event)=>{handleLstChange(event.target.value, mtd-1, 'mtd')}}
                />
                <IconButton aria-label="delete" color="primary" onClick={() => {handleDelete(mtd, 'mtd')}}>
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <Button variant="outlined" onClick={() => {handleAdd('mtd')}} size="small">+</Button>
          </Grid>

          {/* add meal_type  select */}
          <Grid item xs={12} sm={4}>
            <InputLabel htmlFor="demo-customized-select-native">Meal Type</InputLabel>
              <Select
                id="demo-customized-select-native"
                value={mealtype}
                onChange={(event)=>{handleChangeMealtype(event.target.value)}}
                input={<BootstrapInput />}
              >
                <MenuItem value={'BBQ'}>BBQ</MenuItem>
                <MenuItem value={'Salad'}>Salad</MenuItem>
                <MenuItem value={'Cake'}>Cake</MenuItem>
                <MenuItem value={'Snacks'}>Snacks</MenuItem>
                <MenuItem value={'Pizza'}>Pizza</MenuItem>
              </Select>
          </Grid>
          
          {/* confirm submit new recipe post button */}
          <Grid item xs={12} sm={12}>
            <Button variant="contained" color="primary" onClick={handleSubmit}>submit recipe</Button>
          </Grid>
      </Grid>
      
        </Paper>

        {/* Alert Message shows up when error occurs */}
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={severity}>
            {alertMsg}
          </Alert>
        </Snackbar>

      </main>
      <Copyright/>
    </React.Fragment>
  );
}

export default EditRecipe;