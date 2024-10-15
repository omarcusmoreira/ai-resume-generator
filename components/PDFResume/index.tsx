import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import parse, { domToReact, HTMLReactParserOptions, Element, DOMNode } from 'html-react-parser';

import RobotoRegular from '../../fonts/Roboto-Regular.ttf';
import RobotoBold from '../../fonts/Roboto-Bold.ttf';
import RobotoItalic from '../../fonts/Roboto-Italic.ttf';
import RobotoBoldItalic from '../../fonts/Roboto-BoldItalic.ttf';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: RobotoRegular },
    { src: RobotoBold, fontWeight: 'bold' },
    { src: RobotoItalic, fontStyle: 'italic' },
    { src: RobotoBoldItalic, fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Roboto',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  heading1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  heading2: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  heading3: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 6,
  },
  list: {
    marginLeft: 10,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 6,
  },
  footer: {
    position: 'absolute',
    fontSize: 10,
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
});

const convertHtmlToReactPdf = (htmlContent: string): React.ReactNode => {
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        switch (domNode.name) {
          case 'h1':
            return <Text style={styles.heading1}>{domToReact(domNode.children as DOMNode[], options)}</Text>;
          case 'h2':
            return <Text style={styles.heading2}>{domToReact(domNode.children as DOMNode[], options)}</Text>;
          case 'h3':
            return <Text style={styles.heading3}>{domToReact(domNode.children as DOMNode[], options)}</Text>;
          case 'p':
            return <Text style={styles.paragraph}>{domToReact(domNode.children as DOMNode[], options)}</Text>;
          case 'ul':
            return (
              <View style={styles.list}>
                {domToReact(domNode.children as DOMNode[], options)}
              </View>
            );
          case 'li':
            return <Text style={styles.listItem}>• {domToReact(domNode.children as DOMNode[], options)}</Text>;
          case 'a':
            return <Text style={styles.paragraph}>{domToReact(domNode.children as DOMNode[], options)}</Text>;
          default:
            return undefined;
        }
      }
    }
  };

  return parse(htmlContent, options);
};

interface PDFDocumentProps {
  content: string;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ content }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          {convertHtmlToReactPdf(content)}
        </View>
        <Text style={styles.footer} render={({ pageNumber, totalPages }) => (
          `Gerado por MeContrata.ai | Página ${pageNumber} de ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  );
  
  export default PDFDocument;