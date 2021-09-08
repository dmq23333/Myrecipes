import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
// import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';

const useStyles = makeStyles((theme) => ({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
  gap: {
    '& > *': {
      margin: theme.spacing(1),
      width: '80%',
    },
  },
}));

function TemporaryDrawer (props) {
  // this is for the drawer of making comments, when clicking comment button, shows up
  // props only contain one info of open, it controls whether this drawer open or not
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [cmt, setComment] = React.useState('');
  const rid = parseInt(props.rid);
  const sessionToken = sessionStorage.getItem('token');

  // when press tab or shift, continue otherwise set the open status
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setOpen(open);
  };

  // handle the process when user click confirm comment button, fetch the patch comment api
  const patchComment =  () => {
    const url = 'http://localhost:5000/recipe/comment?id=' + rid;
    const commentBody = {
      comment: cmt
    }
    fetch(url, {
      method: 'PATCH',
      body: JSON.stringify(commentBody),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'T ' + sessionToken
      }
    }).then(rs => {
    if (rs.status === 200) {
      rs.json().then(result => {
        console.log(result);
        toggleDrawer(false);
        window.location.reload();
      })
    } else {
      rs.json().then(result => {
        console.log(result.message);
      })}
    })
  }


  // only for load the component 'drawer' content
  const list = (anchor) => (
    <div
      className={clsx(classes.list, {
        [classes.fullList]: anchor === 'top' || anchor === 'bottom',
      })}
      role="presentation"
      // onClick={toggleDrawer(false)}
      // onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem><Button variant="contained" color="default" onClick={patchComment}>confirm comment</Button></ListItem>
        <ListItem className={classes.gap}>
          <TextField
          id="outlined-multiline-static"
          label="Add Comments"
          multiline
          rows={4}
          variant="outlined"
          onChange={(e)=>{setComment(e.target.value)}}
        />
        </ListItem>
      </List>
    </div>
  );

  return (
    <div>
        <React.Fragment key={'bottom'}>
          <Button variant="contained" color="primary" onClick={toggleDrawer(true)}>comment</Button>
          <Drawer anchor={'bottom'} open={open} onClose={toggleDrawer(false)}>
          {list('bottom')}
          </Drawer>
        </React.Fragment>
    </div>
  );
}

TemporaryDrawer.propTypes = {
  rid: PropTypes.string
}

export default TemporaryDrawer;