import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import Box from '@material-ui/core/Box';
import Copyright from '../components/Copyright';
import { useHistory } from 'react-router';
import { useDispatch } from 'react-redux';

const useStyles = makeStyles((theme) => ({
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

export default function SignIn () {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [un, setUn] = useState('');
  const [pwd, setPwd] = useState('');
  const [alertMsg, setAlertMsg] = useState('');
  const [severity, setSeverity] = useState('');
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
      setSeverity('error');
      setAlertMsg('Both username and password is needed');
      return false;
    }

    const loginBody = {
      username: un,
      password: pwd
    }

    // only for testing
    // const loginBody = {
    //   username: 'updateUser',
    //   password: '5678'
    // }

    fetch('http://127.0.0.1:5000/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginBody),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(result => {
      if(result.status === 200){
        result.json().then(result => {
          // console.log('token ' + result.token);
          setSeverity('success');
          setAlertMsg('successfully log in!')
          setOpen(true);
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
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Myrecipes || Sign in
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="Username"
            autoComplete="Username"
            autoFocus
            onChange={(event) => {setUn(event.target.value) }}
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
            onChange={(event) => {setPwd(event.target.value)}}
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
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="../updateProfile" variant="body2">
                Update Profile?
              </Link>
            </Grid>
            <Grid item>
            <Link href="../signUp" variant="body2">
                {"Don't have an account? Sign Up"}
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
