import React from 'react';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import CardMedia from '@material-ui/core/CardMedia';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { useHistory } from 'react-router-dom';

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
      paddingTop: '75%', // 16:9
      },
    cardContent: {
      flexGrow: 1,
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

  // this is Recipe components which will display all the simple recipe information
function Recipes (props) {
    const classes = useStyles();
    const recipe = props.card;
    const imgSrc = 'data:image/jpeg;base64,' + recipe.src;
    // convert string time to readable date time
    const date = new Date(parseInt(recipe.published)*1000);
    const sessionToken = sessionStorage.getItem('token');
    const [open, setOpen] = React.useState(false);
    const history = useHistory();

    const handleClose = () => {
      setOpen(false);
    }

    const handleClickOpen = () => {
      setOpen(true);
    };

    // handle process when press the like/unlike button
    const handleLike = () => {
      const url = 'http://localhost:5000/recipe/'+ recipe.likeBtnText + '?id=' + recipe.id;
      fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'T ' + sessionToken
        }
      }).then(rs => {
        if (rs.status === 200) {
          window.location.reload();
        } else {
          rs.json().then(result => {
            console.log(result.message);
          })
        }
      })
    }
    // handle delete recipe process
    const handleDelete = () => {
      const url = 'http://localhost:5000/recipe/?id=' + recipe.id;
      fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'T ' + sessionToken
        }
      }).then(rs => {
        if (rs.status === 200) {
          console.log('success deleting');
          setOpen(false);
          window.location.reload();
        } else {
          rs.json().then(result => {
            console.log(result.message);
          })
        }
      })
    }

    return (
        <Grid item xs={12} sm={6} md={4}>
            <Card className={classes.card}>
                <CardMedia
                  className={classes.cardMedia}
                  image={imgSrc}
                  title={recipe.name}
                />
                <CardContent className={classes.cardContent}>
                <Typography gutterBottom variant="h6" component="h3" style={{"textTransform": "capitalize"}}>
                  {recipe.name}
                </Typography >
                <Typography variant="caption" display="block" gutterBottom align="right">
                  <b>{date.toLocaleDateString("en-US")}</b> {date.toLocaleTimeString('en-US')}
                </Typography>
                <Typography variant="caption" display="block" gutterBottom align="right">
                  by <b>{recipe.author}</b>
                </Typography>
                </CardContent>
                <CardActions>
                <Button size="small" color="primary" onClick={()=>{history.push(`../viewRecipe/${recipe.id}`)}}>
                  View
                </Button>
                <Button size="small" color="secondary" onClick={handleLike}>
                  {recipe.liked_num} {recipe.likeBtnText}
                </Button>
                {recipe.sims != null || recipe.sims != undefined
                ?<Button size="small" color="default" disableElevation disabled>
                    {recipe.sims * 100} sim
                  </Button>
                :null
                }

                {/* button groups for delete and edit button */}
                {window.location.pathname === '/profile'
                  ? <ButtonGroup disableElevation variant="text" color="default" size="small">
                      <Button onClick={handleClickOpen}>delete</Button>
                      <Button onClick={()=>{history.push(`../editRecipe/${recipe.id}`)}}>edit</Button>
                    </ButtonGroup>
                  : null
                }
                
                </CardActions>
                <Dialog
                  open={open}
                  onClose={handleClose}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description"
                >
                  <DialogTitle id="alert-dialog-title">{"Are you sure to delete?"}</DialogTitle>
                  <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                      You will delete your recipe <b>{recipe.name}</b>
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleClose} color="primary">
                      Disagree
                    </Button>
                    <Button onClick={handleDelete} color="primary" autoFocus>
                      Agree
                    </Button>
                  </DialogActions>
                </Dialog>
            </Card>
        </Grid>
    );
  }

Recipes.propTypes = {
  card: PropTypes.object,
}

export default Recipes;