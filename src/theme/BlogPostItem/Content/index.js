import React from "react";
import clsx from "clsx";
import { blogPostContainerID } from "@docusaurus/utils-common";
import { useBlogPost } from "@docusaurus/theme-common/internal";
import MDXContent from "@theme/MDXContent";
import SocialShareButtons from "@site/src/components/SocialShareButtons";


export default function BlogPostItemContent({ children, className }) {
	const { isBlogPostPage, metadata } = useBlogPost();

	const { frontMatter, title, permalink } = metadata;
	const { enableShareButtons } = frontMatter;
	const blogPostUrl = new URL(permalink, "https://vinhqngo5.github.io/").href; // Construct full URL
	return (
		<div
			// This ID is used for the feed generation to locate the main content
			id={isBlogPostPage ? blogPostContainerID : undefined}
			className={clsx("markdown", className)}
		>
      {enableShareButtons && isBlogPostPage && (
				<SocialShareButtons
					blogPostUrl={blogPostUrl}
					title={title}
					quote={title} // Use post title as the quote
					hashtag={metadata.tags.map(tag => tag.label)} // Generate hashtags from tags using Docուսaurus convention
				/>
			)}
			<MDXContent>{children}</MDXContent>
      {enableShareButtons && isBlogPostPage && (
				<SocialShareButtons
					blogPostUrl={blogPostUrl}
					title={title}
					quote={title} // Use post title as the quote
					hashtag={metadata.tags.map(tag => tag.label)} // Generate hashtags from tags using Docուսaurus convention
				/>
			)}
		</div>
	);
}
