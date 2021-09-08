import React, { useState, useEffect } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import UpdateOutlinedIcon from '@material-ui/icons/UpdateOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
// import Container from '@material-ui/core/Container';
import { useDispatch } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Copyright from '../components/Copyright';
import { useHistory } from 'react-router';
import Paper from '@material-ui/core/Paper';
import background from '../imgs/background.jpg'

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: `url(${background})`,
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(1),
  },
  signIn: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function UpdateProfile () {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [un, setUn] = useState('');
  const [pwd, setPwd] = useState('');
  const [email, setEmail] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [severity, setSeverity] = useState('error');
  const [fillin, setFillin] = useState({'email':'', 'username':'', 'password':''});
  const dispatch = useDispatch();
  const history = useHistory();

  const handleClose = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  }

  const checkUsername = () => {
    return (un === '');
  }

  const checkPwd = () => {
    return (pwd === '');
  }

  // handle the process when clicking the submit change button
  const handleSubmit = () => {

    if (checkUsername() || checkPwd()) {
      setOpen(true);
      setAlertMsg('Email, username and password is needed');
      return false;
    }

    const patchBody = {
      username: un,
      password: pwd,
      email: email
    }

    fetch('http://127.0.0.1:5000/user/', {
      method: 'PATCH',
      body: JSON.stringify(patchBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'T ' + sessionStorage.getItem('token')
      }
    }).then(result => {
      if(result.status === 200){
        result.json().then(result => {
          setSeverity('success');
          setAlertMsg('successfully Edit! Page reload to logging')
          setOpen(true);
          console.log(result);
          dispatch({ type: 'setToken', payload: '' });
          sessionStorage.removeItem('token')
          setTimeout(() => history.push('../login'), 500);
        })
      } else {
        result.json().then(result => {
          console.log(result.message);
          setAlertMsg(result.message);
          setSeverity('error');
          setOpen(true);
        })
      }
    })
  }

  // fetch user info as an instruction for users
  const getInfo = () => {
    const url = 'http://127.0.0.1:5000/user';
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'T ' + sessionStorage.getItem('token')
      }
    }).then(result => {
      if(result.status === 200){
        result.json().then(result => {
          // console.log(result);
          const newFill = {'email':result.email, 'username':result.username, 'password':result.password};
          setFillin(newFill);
        })
      } else {
        result.json().then(result => {
          console.log(result.message);
          setAlertMsg(result.message);
          setSeverity('error');
          setOpen(true);
        })
      }
    })
  }

  // fetch all user Information once the page loads
  useEffect(() => {
    getInfo();
  }, []);

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <UpdateOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Update My Profile
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label={fillin.email}
              name="email"
              autoComplete="email"
              autoFocus
              onChange={(e) => {setEmail(e.target.value)}}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="username"
              label={fillin.username}
              name="name"
              autoFocus
              onChange={(e) => {setUn(e.target.value)}}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={fillin.passwod}
              autoComplete="current-password"
              onChange={(e) => {setPwd(e.target.value)}}
            />
            <Button
              type="button"
              fullWidth
              variant="contained"
              color="primary"
              className={classes.signIn}
              onClick={handleSubmit}
            >
              confirm edit
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="../signUp" variant="body2">
                  Sign Up
                </Link>
              </Grid>
              <Grid item>
                <Link href="../login" variant="body2">
                  Already have an account? Sign In
                </Link>
              </Grid>
            </Grid>      
            <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
              <Alert onClose={handleClose} severity={severity}>
                {alertMsg}
              </Alert>
            </Snackbar>
          </form>
        </div>
      <Box mt={8}>
        <Copyright />
      </Box>
      </Grid>
    </Grid>
  );
}
