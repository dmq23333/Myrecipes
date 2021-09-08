import React, { useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Copyright from '../components/Copyright';
import Navbar from '../components/Navbar';
import Recipes from '../components/Recipes';
import Button from '@material-ui/core/Button';
import { useHistory } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
// import { useSelector } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import ButtonGroup from '@material-ui/core/ButtonGroup';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
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
  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    marginTop: theme.spacing(8),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.up('sm')]: {
      paddingTop: theme.spacing(6),
      paddingBottom: theme.spacing(6),
    },
  },
}));


export default function Dashboard() {
  const classes = useStyles();
  const history = useHistory();
  const [recipeLst, setRecipeLst] = React.useState([]);
  // const token = useSelector(state => state.token).token;
  const sessionToken = sessionStorage.getItem('token');
  const [alertMsg, setAlertMsg] = React.useState('');
  const [severity, setSeverity] = React.useState('info');
  const [open, setOpen] = React.useState(false);
  const [stage, setStage] = React.useState(0);
  const [sort, setSort] = React.useState('published');

  // handle close process on alert message bar
  const handleClose = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }

  // fetch all Recipes belong to admin followed
  function getRecipes () {
    if(sessionToken.length===null){
      setOpen(true);
      setSeverity('warning');
      setAlertMsg('Please Log in!');
    }


    const url = 'http://localhost:5000/user/feed?sort=' + sort;
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Token ' + sessionToken
      }
    }).then(rs => {
      if (rs.status === 200) {
        rs.json().then(result => {
          if(result.recipes.length === 0) {
            setOpen(true);
            setSeverity('info');
            setAlertMsg('We dont get any recipes yet! Maybe you should follow someone.');
          }
          let authors = [];
          result.recipes.map((rcp) => {
            if(!authors.includes(rcp.author)){
              authors.push(rcp.author);
            }
            rcp['likeBtnText'] = rcp.likes.includes(result.userId)?'unlike':'like'
          });
          sessionStorage.setItem('following', authors);
          sessionStorage.setItem('userId', result.userId);
          setRecipeLst(result.recipes);
        })
      } else {
        rs.json().then(result => {
          console.log(result.message);
        })
      }
    })
  }

  // fetch all recipes once the page loads
  useEffect(() => {
    getRecipes();
  }, [stage]);

  return (
    <React.Fragment>
      <CssBaseline />
      {/* TOP APP bar/nav bar */}
      <Navbar />
      {/* create button for user to create a new recipe, needed to be done. there should provide a new page for user to add recipe */}
            {/* Hero unit */}
        <div className={classes.heroContent}>
          <Container maxWidth="sm">
            <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
              My Recipes
            </Typography>
            <Typography variant="h5" align="center" color="textSecondary" paragraph>
              Welcome to My Recipes. Here could find out all recipes from your following users!
            </Typography>
            <div className={classes.heroButtons}>
              <Grid container spacing={1} justifyContent="center">
                <Grid item>
                <Button variant="contained" size="small" color="secondary" onClick={()=>{history.push('../createRecipe')}}>
                  New Recipe
                </Button>
                </Grid>
              </Grid>
            </div>
          </Container>
        </div>
        {/* End hero unit */}

        {/* Alert Message shows up when error occurs */}
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={severity}>
            {alertMsg}
          </Alert>
        </Snackbar>

        {/* grid container for sort recipes, user could sort either in time or liked_num order*/}
        <Grid container spacing={1} justifyContent="flex-end">
          <Grid item>
            sort by:
            <ButtonGroup variant="text" color="primary" aria-label="text primary button group">
              <Button onClick={() => { setStage(stage+1); setSort('published');}}>time</Button>
              <Button onClick={() => { setStage(stage+1); setSort('liked_num');}}>likes</Button>
            </ButtonGroup>
          </Grid>
        </Grid>

      {/* for feed loaded, render with user following's recipes */}
      <Container className={classes.cardGrid} maxWidth="md">
        <Grid container spacing={4}>
          {recipeLst.map((recipe) => (
            <Recipes key={recipeLst.indexOf(recipe)} card={recipe}/>
            ))}
        </Grid>
      </Container>
      {/* Footer */}
      <Container maxWidth="md" component="footer" className={classes.footer}>
        <Box mt={5}>
          <Copyright />
        </Box>
      </Container>
      {/* End footer */}
    </React.Fragment>
  );
}