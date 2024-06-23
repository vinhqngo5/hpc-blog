import React from 'react';
import {
  FacebookShareButton,
  LinkedinShareButton,
  RedditShareButton,
  TwitterShareButton,
} from 'react-share';
import { FaFacebook, FaLinkedin, FaReddit, FaTwitter } from 'react-icons/fa';
const SocialShareButtons = ({ blogPostUrl, title, description, hashtag }) => {
  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: 8, // Adjust spacing as needed
      marginTop: 8 ,
    },
    shareText: {
      marginRight: 4, // Adjust spacing as needed
      fontWeight: 'bold', // Make bold
    },
    button: {
      marginLeft: 4, // Adjust spacing as needed
      padding: '4px 6px 0px 6px',
      borderRadius: 4,
      cursor: 'pointer',
    },
    facebookButton: {
      backgroundColor: '#3B5998', // Facebook blue
      color: '#fff', // White text
    },
    linkedinButton: {
      backgroundColor: '#0077b5', // LinkedIn blue
      color: '#fff', // White text
    },
    redditButton: {
      backgroundColor: '#ff4500', // Reddit orange
      color: '#fff', // White text
    },
    twitterButton: {
      backgroundColor: '#1DA1F2', // Twitter blue
      color: '#fff', // White text
    },
  };

  return (
    <div style={styles.container}>
      <span style={styles.shareText}>Share: </span>
      <FacebookShareButton
        url={blogPostUrl}
        quote={title}
        hashtags={hashtag}
        className="social-button facebook-button"
        style={{ ...styles.button, ...styles.facebookButton }} // Apply both button and Facebook button styles
      >
        <FaFacebook />
      </FacebookShareButton>
      <LinkedinShareButton
        url={blogPostUrl}
        title={title}
        summary={description}
        className="social-button linkedin-button"
        source={blogPostUrl}
        style={{ ...styles.button, ...styles.linkedinButton }} // Apply both button and LinkedIn button styles
      >
        <FaLinkedin />
      </LinkedinShareButton>
      <RedditShareButton
        url={blogPostUrl}
        title={title}
        hashtags={hashtag}
        className="social-button reddit-button"
        style={{ ...styles.button, ...styles.redditButton }}
      >
        <FaReddit />
      </RedditShareButton>
      <TwitterShareButton
        url={blogPostUrl}
        title={title}
        hashtags={hashtag}
        via="your_twitter_handle" // Replace with your Twitter handle
        className="social-button twitter-button"
        style={{ ...styles.button, ...styles.twitterButton }}
      >
        <FaTwitter />
      </TwitterShareButton>
    </div>
  );
};



export default SocialShareButtons;