import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import PageviewIcon from '@material-ui/icons/Pageview';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: '0.5 0 auto',
  },
  cover: {
    width: 151,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  playIcon: {
    height: 38,
    width: 38,
  },
}));

// this is component for displaying the simple user information
function UserCard(props) {
  const classes = useStyles();
  // console.log(props.card);
  const user = props.card;
  const history = useHistory();

  return (
    <Grid item xs={12} sm={6} md={4}>
    <Card className={classes.root}>
      <div className={classes.details}>
        <CardContent className={classes.content}>
          <Typography component="h5" variant="h5">
            {user.username}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            email : {user.email}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            followednum : {user.followed_num}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            recipe_num : {user.recipe_num}
          </Typography>
          {/* <Typography variant="subtitle2" color="textSecondary">
            Mac Miller
          </Typography> */}
        </CardContent>
        <div className={classes.controls}>
          <IconButton aria-label="play/pause" onClick={() => { history.push(`../profile/${user.username}`) }}>
            <PageviewIcon className={classes.playIcon} /> detail
          </IconButton>
        </div>
      </div>
      <CardMedia
        className={classes.cover}
        image={require('../imgs/avatar.jpg').default}
        title="Live from space album cover"
      />
    </Card>
    </Grid>
  );
}

UserCard.propTypes = {
    card: PropTypes.object,
}

export default UserCard;