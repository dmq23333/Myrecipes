import React, { useEffect } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import '../css/profile.css';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Copyright from '../components/Copyright';
import Navbar from '../components/Navbar';
import Recipes from '../components/Recipes';
import Button from '@material-ui/core/Button';
import { useHistory, useParams } from 'react-router-dom';
// import { useSelector } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
// import avatar from '../imgs/avatar.jpg';
import ButtonGroup from '@material-ui/core/ButtonGroup';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

// css part
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
    // backgroundColor: theme.palette.background.paper,
    backgroundColor: '#F6F6F6',
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


export default function Profile() {
  const classes = useStyles();
  const history = useHistory();
  const [recipeLst, setRecipeLst] = React.useState([]);
  let username  = useParams().username;
  // const token = useSelector(state => state.token).token;
  const userId = parseInt(sessionStorage.getItem('userId'));
  const sessionToken = sessionStorage.getItem('token');
  const [alertMsg, setAlertMsg] = React.useState('');
  const [severity, setSeverity] = React.useState('info');
  const [open, setOpen] = React.useState(false);
  const [user, setUser] = React.useState({'following':[]});
  const [stage, setStage] = React.useState(0);
  const [sort, setSort] = React.useState('published');
  const [buttonText, setButtonText] = React.useState('subscribe');
  let followList = sessionStorage.getItem('following');
  followList = followList.split(',');

  // handle close the alert message bar
  const handleClose = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }


  // handle the process when user clicking the subscribe or unsubscribe button
  const handleFollow = () => {
    const url = 'http://localhost:5000/user/' + buttonText + '?username=' + username;
    fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'T ' + sessionToken
      }
    }).then(rs => {
      if (rs.status === 200) {
        if(buttonText==='subscribe'){
          followList.push(username);
          setButtonText('unsubscribe');
        } else {
          followList.pop(username);
          setButtonText('subscribe');
        }
        sessionStorage.setItem('following', followList);
        setStage(stage+1);
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

  // fetch User infomation and recipes belong to the user provided
  function getUserInfo () {
    if(sessionToken.length===null){
      setOpen(true);
      setSeverity('warning');
      setAlertMsg('Please Log in!');
    }

    if(username === undefined){
      username = '';
    }

    const url = 'http://localhost:5000/user/?username=' + username + '&sort='+ sort;
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
            setAlertMsg('We dont get any recipes yet!');
          }
          // console.log(followList.includes(username));
          if (followList.includes(username)) {
            setButtonText('unsubscribe');
          }
          result.recipes.map((rcp) => {
            rcp['likeBtnText'] = rcp.likes.includes(parseInt(userId))?'unlike':'like'
          });
          setUser(result);
          setRecipeLst(result.recipes);
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

  // fetch all recipes once the page loads, and when change to another sort order, the recipe list reload
  useEffect(() => {
    getUserInfo();
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
            {/* user ptofile for his own avatar */}
            <div className="photo-container">
              {/* <img className="photo-img" alt="..." src={avatar} /> */}
              <img className="photo-img" alt="..." src={require('../imgs/avatar.jpg').default} />
            </div>
            <h3 className="title"> {username==='' ? 'welcome' : null} 
                                    <span className="title-span">{user.username}</span></h3>
            <p className="email">{user.email}</p>

            <Grid container spacing={1} justifyContent="center">
              <Grid item>
                <div className="social-description">
                  <h2>{user.following.length}</h2>
                  <p>following</p>
                </div>
              </Grid>
              <Grid item>
                <div className="social-description">
                  <h2>{user.followed_num}</h2>
                  <p>followed</p>
                </div>
              </Grid>
              <Grid item>
                <div className="social-description">
                  <h2>{user.liked_num}</h2>
                  <p>Likes</p>
                </div>
              </Grid>
            </Grid>

            <Grid container spacing={1} justifyContent="center">
              <Grid item>
                <Button variant="contained" color="secondary" onClick={()=>{history.push('../createRecipe')}}>
                  New Recipe
                </Button>               
              </Grid>

              {/* let user view following or fans list */}
              {username==='' || username===undefined
                ? <Grid item>
                    <Button variant="contained" color="secondary" onClick={()=>{history.push(`../fans/${user.username}`)}}>
                      view Following
                    </Button>
                  </Grid>
                : <Grid item>
                    <Button variant="contained" color="secondary" onClick={()=>{history.push(`../fans/${username}`)}}>
                      view Following
                    </Button>
                  </Grid>
              }

              {/* edit user profile button shows up when user himself logged in*/}
              {username==='' || username===undefined
              ? <Grid item>
                <Button variant="contained" color="primary" onClick={()=>{history.push('../updateProfile')}}>
                  Edit profile
                </Button>
                </Grid>
              : null
              }
              
              {/* follow button shows up when not following the user*/}
              {username==='' || username===undefined
              ? null
              : <Grid item>
                  <Button variant="contained" color="primary" onClick={handleFollow}>
                    {buttonText}
                  </Button>
                </Grid>}
            </Grid>

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