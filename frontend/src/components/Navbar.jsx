import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Toolbar from '@material-ui/core/Toolbar';
import Link from '@material-ui/core/Link';
import CssBaseline from '@material-ui/core/CssBaseline';
import { alpha, makeStyles } from '@material-ui/core/styles';
// import { useSelector } from 'react-redux';
import Logout from './Logout';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import { useHistory } from 'react-router-dom';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

const useStyles = makeStyles((theme) => ({
    '@global': {
      ul: {
        margin: 0,
        padding: 0,
        listStyle: 'none',
      },
    },
    appBar: {
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
    toolbar: {
      flexWrap: 'wrap',
    },
    toolbarTitle: {
      flexGrow: 1,
    },
    link: {
      margin: theme.spacing(1, 1.5),
    },
    search: {
      position: 'relative',
      borderRadius: theme.shape.borderRadius,
      backgroundColor: alpha(theme.palette.common.white, 0.15),
      '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
      },
      marginLeft: 0,
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(1),
        width: 'auto',
      },
    },
    searchIcon: {
      padding: theme.spacing(0, 2),
      height: '100%',
      position: 'absolute',
      pointerEvents: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputRoot: {
      color: 'inherit',
    },
    inputInput: {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
      transition: theme.transitions.create('width'),
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        width: '16ch',
        '&:focus': {
          width: '24ch',
        },
      },
    },
  }));

  export default function Navbar() {
    const classes = useStyles();
    const sessionToken = sessionStorage.getItem('token');
    const history = useHistory();
    const portNum = window.location.port;
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);


    // handle search request on nav bar
    const handleKeyDown = (event) => {
      const searchParams = event.target.value;

      // when press enter button, convert to search page and loaded
      if(event.keyCode === 13){
        history.push('../searchResult/' + searchParams);
      }
      
    }

    // handle the menu open/close on the nav bar
    const handleMenu = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    // when clickaway, the toggled menu will be closed
    // when click the categorie of data, will redirect to viewCategory page
    const handleClose = (type) => {
      setAnchorEl(null);
      // console.log(type);
      if(['BBQ', 'Salad', 'Cake', 'Snacks', 'Pizza'].indexOf(type) != -1){
        history.push(`../viewCategories/${type}`);
      }
    };
  
    return (
      <React.Fragment>
        <CssBaseline />
        {/* TOP APP bar/nav bar */}
        <AppBar position="static" color="default" elevation={0} className={classes.appBar}>
          <Toolbar className={classes.toolbar}>
            <Typography variant="h6" color="inherit" noWrap className={classes.toolbarTitle}>
              <Link color="textPrimary" href={`http://localhost:${portNum}/dashboard`}>Myrecipes</Link>
            </Typography>

              {/* {add search bar} */}
              <div className={classes.search}>
                <div className={classes.searchIcon}>
                  <SearchIcon />
                </div>
                <InputBase
                  placeholder="Search Recipes…"
                  classes={{
                  root: classes.inputRoot,
                  input: classes.inputInput,
                  }}
                  inputProps={{ 'aria-label': 'search' }}
                  onKeyDown={(event) => {handleKeyDown(event)}}
                />
              </div>
              <Link onClick={handleMenu} variant="button" color="textPrimary">
              Categories
              </Link>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={open}
                onClose={handleClose}
              >
                <MenuItem style={{'width': '94.76px'}} onClick={()=>handleClose('BBQ')}>BBQ</MenuItem>
                <MenuItem onClick={()=>handleClose('Salad')}>Salad</MenuItem>
                <MenuItem onClick={()=>handleClose('Cake')}>Cake</MenuItem>
                <MenuItem onClick={()=>handleClose('Snacks')}>Snacks</MenuItem>
                <MenuItem onClick={()=>handleClose('Pizza')}>Pizza</MenuItem>
              </Menu>

            <nav>
              <Link variant="button" color="textPrimary" href={`http://localhost:${portNum}/profile`} className={classes.link}>
                My account
              </Link>
            </nav>

            {/* {console.log(token.length == 0)} */}
            {sessionToken === null
              ? <Button href="../login" color="primary" variant="outlined" className={classes.link} >
                    Login
                </Button>
              : <Logout/>
            }

          </Toolbar>
        </AppBar>
      </React.Fragment>
  );
}