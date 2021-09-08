import React, { useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Copyright from '../components/Copyright';
import Navbar from '../components/Navbar';
import Recipes from '../components/Recipes';
// import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
// import { useSelector } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';

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
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2, 0, 6),
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


export default function SearchResult() {
  const classes = useStyles();
  // const history = useHistory();
  const [recipeLst, setRecipeLst] = React.useState([]);
  // const token = useSelector(state => state.token).token;
  const sessionToken = sessionStorage.getItem('token');
  const [alertMsg, setAlertMsg] = React.useState('');
  const [severity, setSeverity] = React.useState('info');
  const [open, setOpen] = React.useState(false);
  const query = useParams().query;
  const [stage, setStage] = React.useState(0);
  const [sort, setSort] = React.useState('published');
  const userId = sessionStorage.getItem('userId');

  const handleClose = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }

  // fetch all Recipes of the search results
  function getRecipes () {
    if(sessionToken.length===null){
      setOpen(true);
      setSeverity('warning');
      setAlertMsg('Please Log in!');
    }


    const url = 'http://localhost:5000/recipe/search?qp=' + query + '&sort=' + sort;
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
            setAlertMsg('We dont get any recipes yet! Try another keyword');
          }
          result.recipes.map((rcp) => {
            rcp['likeBtnText'] = rcp.likes.includes(parseInt(userId))?'unlike':'like'
          });
          setRecipeLst(result.recipes);
        })
      } else {
        rs.json().then(result => {
          setOpen(true);
          setSeverity('error');
          setAlertMsg(result.message);
        })
      }
    })
  }

  // fetch all recipes once the page loads, and when change to another sort order, the recipe list reload
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
              Search Result
            </Typography>
            <Typography variant="h5" align="center" color="textSecondary" paragraph>
              Results for {`"${query}"`}
            </Typography>
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