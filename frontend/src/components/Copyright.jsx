import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import React from 'react';

// this is the footer component for the whole system
export default function Copyright() {
  const portNum = window.location.port;
    return (
      <Typography variant="body2" color="textSecondary" align="center">
        {'Copyright © '}
        <Link color="inherit" href={`http://localhost:${portNum}/login`}>
          MyRecipes
        </Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </Typography>
    );
  }