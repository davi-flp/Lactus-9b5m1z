import { AlertProvider } from '@/template';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NotesProvider } from '../contexts/NotesContext';
import { TasksProvider } from '../contexts/TasksContext';
import { ProjectsProvider } from '../contexts/ProjectsContext';
import { CalendarProvider } from '../contexts/CalendarContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <NotesProvider>
          <TasksProvider>
            <ProjectsProvider>
              <CalendarProvider>
                <StatusBar style="light" />
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="note-editor" options={{ presentation: 'modal' }} />
                  <Stack.Screen name="task-editor" options={{ presentation: 'modal' }} />
                  <Stack.Screen name="event-editor" options={{ presentation: 'modal' }} />
                  <Stack.Screen name="project-detail" />
                </Stack>
              </CalendarProvider>
            </ProjectsProvider>
          </TasksProvider>
        </NotesProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
