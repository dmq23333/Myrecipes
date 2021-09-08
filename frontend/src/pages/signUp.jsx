import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { useDispatch } from 'react-redux';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Copyright from '../components/Copyright';
import { useHistory } from 'react-router';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
  image: {
    backgroundImage: 'url(https://source.unsplash.com/random)',
    backgroundRepeat: 'no-repeat',
    backgroundColor:
      theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  signIn: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function SignUp () {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [un, setUn] = useState('');
  const [pwd, setPwd] = useState('');
  const [email, setEmail] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [severity, setSeverity] = useState('error');
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

  const handleSubmit = () => {

    if (checkUsername() || checkPwd()) {
      setOpen(true);
      setAlertMsg('Email, username and password is needed');
      return false;
    }

    const signupBody = {
      username: un,
      password: pwd,
      email: email
    }

    fetch('http://127.0.0.1:5000/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupBody),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(result => {
      if(result.status === 200){
        result.json().then(result => {
          setSeverity('success');
          setAlertMsg('successfully sign up!')
          setOpen(true);
          console.log(result);
          dispatch({ type: 'setToken', payload: result.token });
          sessionStorage.setItem('token', result.token);
          history.push('../dashboard');
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

  return (
    <Container component="main" maxWidth="xs" className={classes.root}>
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          MyRecipes || Sign up
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
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
            label="User Name"
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
            autoComplete="current-password"
            onChange={(e) => {setPwd(e.target.value)}}
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="button"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.signIn}
            onClick={handleSubmit}
          >
            Sign Up
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="../updateProfile" variant="body2">
                Update Profile?
              </Link>
            </Grid>
            <Grid item>
              <Link href="../login" variant="body2">
                {"Already have an account? Sign In"}
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
    </Container>
  );
}
