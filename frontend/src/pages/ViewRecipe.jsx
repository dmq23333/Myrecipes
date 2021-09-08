import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Navbar from '../components/Navbar';
import Paper from '@material-ui/core/Paper';
import Copyright from '../components/Copyright';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { useParams } from 'react-router-dom';
import '../css/viewRecipe.css';
import Container from '@material-ui/core/Container';
import Recipes from '../components/Recipes';
import TemporaryDrawer from '../components/commentDrawer';
import { useHistory } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import ShareRcp from '../components/shareRcp';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
        '& .Typography': {
          margin: theme.spacing(1),
          width: 100,
        },
    },
  rightIcon: {
    marginLeft: theme.spacing(1),
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
  button: {
    margin: theme.spacing(1),
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
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
  },
  cardContent: {
    flexGrow: 1,
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
}));

function ViewRecipe () {
  const classes = useStyles();
  const sessionToken = sessionStorage.getItem('token');
  const [alertMsg, setAlertMsg] = React.useState('');
  const [severity, setSeverity] = React.useState('info');
  const [open, setOpen] = React.useState(false);
  const [stage, setStage] = useState(0);
  const rid = useParams().rid;
  const [recipe, setRecipe] = useState({'ingredients': [], 'method': [], 'proportion': [], 'comments': []});
  const [recipeLst, setRecipeLst] = useState([]);
  const userId = sessionStorage.getItem('userId');
  const date = new Date(parseInt(recipe.published)*1000);
  const history = useHistory();

  const handleClose = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }

  // fetch requested recipe detailed information
  const getInfo = () => {
    const url = 'http://localhost:5000/recipe/?id='+ rid;
    fetch(url, {
      method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'T ' + sessionToken
        }
      }).then(rs => {
        if (rs.status === 200) {
          rs.json().then(result => {
            // console.log(result);
            setRecipe(result);
          })
        } else {
          rs.json().then(result => {
            setStage(stage+1);
            console.log(result.message);
            setOpen(true);
            setSeverity('error');
            setAlertMsg(result.message);
          })
        }
      })
  }

  // fetch recommendations belong to this recipe
  const getRecommendation = () => {
    const url = 'http://localhost:5000/recipe/recommend?id='+ rid;
    fetch(url, {
      method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'T ' + sessionToken
        }
      }).then(rs => {
        if (rs.status === 200) {
          rs.json().then(result => {
            // console.log(result);
            const rcpLst = [];
            result.recipes.map((data) => {
              if(data[0].id != rid){
                data[0]['likeBtnText'] = data[0].likes.includes(parseInt(userId))?'unlike':'like'
                data[0]['sims'] = data[1];
                rcpLst.push(data[0]);
              }
            })
            setRecipeLst(rcpLst);
          })
        } else {
          rs.json().then(result => {
            setStage(stage+1);
            console.log(result.message);
            setOpen(true);
            setSeverity('error');
            setAlertMsg(result.message);
          })
        }
      })
  }

  // fetch recipe information once page loads, and when request for anot the recipe, the page reload
  useEffect(() => {
    getInfo();
    getRecommendation();
  }, [stage+rid]);

  return (
    <React.Fragment>
      <CssBaseline />
      <Navbar />
      <main className={classes.layout}>
        <Paper className={classes.paper} id="rcp_paper">
          <h1 className="recipe_name">{recipe.name}</h1>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <img className="image_container" src={'data:image/jpeg;base64,' + recipe.src}/>
          </Grid>
          <Grid item xs={12} sm={6}>
            <p className="recipe_subtitle">ATUHOR   
            <Button className="recipe_contains" onClick={()=>{history.push(`../profile/${recipe.author}`)}}> {recipe.author}</Button></p>
            <p className="recipe_subtitle">LIKE  <span className="recipe_contains">{recipe.liked_num}</span></p>
            <p className="recipe_subtitle">MEAL TYPE  <span className="recipe_contains">{recipe.meal_type}</span></p>
            <p className="recipe_subtitle">PUBLISHED  
              <span className="recipe_contains"> {date.toLocaleDateString("en-US")} {date.toLocaleTimeString('en-US')}</span>
            </p>
          </Grid>

          {/* recipe ingredients and proportion showing dom */}
          <Grid item xs={12} sm={9}>
          <p className="recipe_subtitle">Ingredients and Proportions </p>
            {recipe.ingredients.map((igd, idx) => (
              <div key={idx} className={classes.root}>
                <span className="recipe_contains">
                  {igd} {(recipe.proportion)[idx]}
                </span>
              </div>
            ))}
          </Grid>
          {/* share button for users to share their interested recipes */}
          <Grid item xs={12} sm={3}>
            <ShareRcp/>
          </Grid>

          {/* showing recipe method dom */}
          <Grid item xs={12} sm={8}>
          <p className="recipe_subtitle">Steps</p>
            {recipe.method.map((mtd, idx) => (
              <div key={idx} className={classes.root}>
                step{idx+1} <span className="recipe_contains">{mtd}</span>
              </div>
            ))}
          </Grid>
          
          {/* confirm submit new recipe post button */}
          <Grid item xs={12} sm={12}>
            <p className="recipe_subtitle">Comments</p>
            {recipe.comments.length === 0
            ? 'no comments yet'
            : recipe.comments.map((cmt, idx) => (
              <div key={idx} className={classes.root}>
                  {cmt.author}: <span className="recipe_contains">{cmt.comment}</span> {(new Date(parseInt(cmt.published)*1000)).toLocaleDateString("en-US")}
              </div>
            ))}
          </Grid>
          {/* comment button */}
          <Grid item xs={12} sm={12}>
            <TemporaryDrawer rid={rid}/>
          </Grid>
      </Grid>
        
        {/* for feed loaded, render with user following's recipes */}
          <Container className={classes.cardGrid} maxWidth="md">
          <p className="recipe_subtitle">Here we recommend these:</p>
            <Grid container spacing={1}>
              {recipeLst.length === 0
              ? 'no recommend yet'
              : recipeLst.map((recipe) => (
                <Recipes key={recipeLst.indexOf(recipe)} card={recipe}/>
                ))}
            </Grid>
          </Container>
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

export default ViewRecipe;